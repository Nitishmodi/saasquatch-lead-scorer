import { eq } from "drizzle-orm";
import type { CompanyProfile, CrawlStatus, Lead } from "@/lib/types";
import { db } from "@/server/db/client";
import { companies } from "@/server/db/schema";
import { crawlSite } from "./crawler";
import { getDomainRegistrationYear } from "./domain-registry";
import { extractProfile } from "./extract-profile";
import { scoreProfile } from "./lead-score";
import { hasMailServer } from "./mail-server";
import { writeOpener } from "./outreach-opener";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function emptyProfile(domain: string, status: CrawlStatus): CompanyProfile {
  return {
    domain,
    status,
    url: null,
    name: null,
    description: null,
    emails: [],
    emailDeliverable: false,
    phones: [],
    socials: {},
    foundedYear: null,
    domainRegisteredYear: null,
    copyrightYear: null,
    platform: null,
    ownership: [],
    opener: null,
  };
}

async function buildProfile(domain: string): Promise<CompanyProfile> {
  const [{ status, pages }, domainRegisteredYear] = await Promise.all([
    crawlSite(domain),
    getDomainRegistrationYear(domain),
  ]);
  if (status !== "ok") return { ...emptyProfile(domain, status), domainRegisteredYear };

  const extracted = extractProfile(domain, pages);
  const emailDomain = extracted.emails[0]?.split("@")[1];
  const profile: CompanyProfile = {
    ...emptyProfile(domain, status),
    ...extracted,
    url: pages[0].url,
    domainRegisteredYear,
    emailDeliverable: emailDomain ? await hasMailServer(emailDomain) : false,
  };

  return { ...profile, opener: await writeOpener(profile) };
}

function toLead(stored: CompanyProfile, fetchedAt: Date, cached: boolean): Lead {
  const profile = { ...emptyProfile(stored.domain, stored.status), ...stored };
  return { ...profile, ...scoreProfile(profile), cached, enrichedAt: fetchedAt.toISOString() };
}

function logCacheError(error: unknown) {
  console.error("[cache] unavailable, continuing without it:", error);
}

export async function enrichDomain(domain: string): Promise<Lead> {
  const [cached] = await db
    .select()
    .from(companies)
    .where(eq(companies.domain, domain))
    .limit(1)
    .catch((error) => {
      logCacheError(error);
      return [];
    });
  if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) {
    return toLead(cached.profile, cached.fetchedAt, true);
  }

  const profile = await buildProfile(domain);
  const fetchedAt = new Date();

  if (profile.status === "ok") {
    await db
      .insert(companies)
      .values({ domain, profile, fetchedAt })
      .onConflictDoUpdate({ target: companies.domain, set: { profile, fetchedAt } })
      .catch(logCacheError);
  }

  return toLead(profile, fetchedAt, false);
}
