import * as cheerio from "cheerio";
import { findPhoneNumbersInText, parsePhoneNumberFromString } from "libphonenumber-js";
import type { Page } from "./crawler";
import type { CompanyProfile, Social } from "@/lib/types";

type ExtractedProfile = Pick<
  CompanyProfile,
  "name" | "description" | "emails" | "phones" | "socials" | "foundedYear" | "copyrightYear" | "platform" | "ownership"
>;

const CURRENT_YEAR = new Date().getFullYear();
const MAX_EMAILS = 5;
const MAX_PHONES = 3;

const EMAIL_SOURCE = String.raw`[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}`;
const EMAIL_PATTERN = new RegExp(EMAIL_SOURCE, "gi");
const VALID_EMAIL = new RegExp(`^${EMAIL_SOURCE}$`, "i");
const JUNK_EMAIL_PATTERN = /\.(png|jpe?g|gif|svg|webp)$|@(example|sentry|wixpress|domain|email)\./i;
const FOUNDED_PATTERN = /\b(?:founded|established|est\.|since)\s+(?:in\s+)?((?:18|19|20)\d{2})\b/gi;
const COPYRIGHT_PATTERN = /(?:©|copyright)\s*(?:(?:19|20)\d{2}\s*[-–]\s*)?((?:19|20)\d{2})/gi;
const TITLE_SEPARATOR = /\s[|–—-]\s|:\s/;

const OWNERSHIP_SIGNALS: [RegExp, string][] = [
  [/family[- ]owned|family business/i, "Family-owned"],
  [/owner[- ]operated/i, "Owner-operated"],
  [/locally owned/i, "Locally owned"],
  [/\b(second|third|fourth|2nd|3rd|4th)[- ]generation\b/i, "Multi-generation"],
  [/veteran[- ]owned/i, "Veteran-owned"],
];

const PLATFORM_MARKERS: [string, string][] = [
  ["cdn.shopify.com", "Shopify"],
  ["wp-content", "WordPress"],
  ["wixstatic.com", "Wix"],
  ["squarespace", "Squarespace"],
  ["webflow", "Webflow"],
  ["godaddy", "GoDaddy"],
];

const SOCIAL_HOSTS: Record<string, Social> = {
  "linkedin.com": "linkedin",
  "facebook.com": "facebook",
  "instagram.com": "instagram",
  "twitter.com": "x",
  "x.com": "x",
  "youtube.com": "youtube",
};

function matchYears(text: string, pattern: RegExp): number[] {
  return [...text.matchAll(pattern)]
    .map((match) => Number(match[1]))
    .filter((year) => year >= 1800 && year <= CURRENT_YEAR);
}

function pickCompanyName(siteName: string | undefined, title: string, domain: string): string | null {
  const candidates = [siteName ?? "", ...title.split(TITLE_SEPARATOR)].map((value) => value.trim()).filter(Boolean);
  const domainPrefix = domain.slice(0, 4);
  const matching = candidates.filter((name) => name.toLowerCase().replace(/[^a-z0-9]/g, "").startsWith(domainPrefix));
  return matching.sort((a, b) => b.length - a.length)[0] ?? candidates[0] ?? null;
}

function extractEmails(hrefs: string[], text: string, domain: string): string[] {
  const fromLinks = hrefs.filter((href) => href.startsWith("mailto:")).map((href) => href.slice(7).split("?")[0]);
  const fromText = text.match(EMAIL_PATTERN) ?? [];
  const emails = [...fromLinks, ...fromText]
    .map((email) => email.replaceAll("%20", "").trim().toLowerCase())
    .filter((email) => VALID_EMAIL.test(email) && !JUNK_EMAIL_PATTERN.test(email));

  return [...new Set(emails)]
    .sort((a, b) => Number(b.endsWith(`@${domain}`)) - Number(a.endsWith(`@${domain}`)))
    .slice(0, MAX_EMAILS);
}

function extractPhones(hrefs: string[], text: string): string[] {
  const fromLinks = hrefs
    .filter((href) => href.startsWith("tel:"))
    .map((href) => parsePhoneNumberFromString(href.slice(4), "US"));
  const fromText = findPhoneNumbersInText(text, "US").map((match) => match.number);
  const phones = [...fromLinks, ...fromText]
    .filter((phone) => phone?.isValid())
    .map((phone) => phone!.formatInternational());

  return [...new Set(phones)].slice(0, MAX_PHONES);
}

function extractSocials(hrefs: string[]): CompanyProfile["socials"] {
  const socials: CompanyProfile["socials"] = {};
  for (const href of hrefs) {
    try {
      const { hostname } = new URL(href);
      const network = SOCIAL_HOSTS[hostname.replace(/^www\./, "")];
      if (network && !socials[network]) socials[network] = href;
    } catch {
      // Relative or malformed links are not social profiles.
    }
  }
  return socials;
}

export function extractProfile(domain: string, pages: Page[]): ExtractedProfile {
  const documents = pages.map((page) => cheerio.load(page.html));
  const home = documents[0];

  const hrefs = documents.flatMap(($) => $("a[href]").map((_, anchor) => $(anchor).attr("href")!.trim()).get());
  const text = documents
    .map(($) => {
      $("script, style, noscript, svg").remove();
      return $("body, body *")
        .contents()
        .filter((_, node) => node.type === "text")
        .map((_, node) => $(node).text())
        .get()
        .join(" ")
        .replace(/\s+/g, " ");
    })
    .join(" ");
  const html = pages.map((page) => page.html).join("\n");

  const name = pickCompanyName(home('meta[property="og:site_name"]').attr("content"), home("title").text(), domain);
  const description =
    home('meta[name="description"]').attr("content")?.trim() ||
    home('meta[property="og:description"]').attr("content")?.trim() ||
    null;
  const foundedYears = matchYears(text, FOUNDED_PATTERN);
  const copyrightYears = matchYears(text, COPYRIGHT_PATTERN);

  return {
    name,
    description,
    emails: extractEmails(hrefs, text, domain),
    phones: extractPhones(hrefs, text),
    socials: extractSocials(hrefs),
    foundedYear: foundedYears.length ? Math.min(...foundedYears) : null,
    copyrightYear: copyrightYears.length ? Math.max(...copyrightYears) : null,
    platform: PLATFORM_MARKERS.find(([marker]) => html.includes(marker))?.[1] ?? null,
    ownership: OWNERSHIP_SIGNALS.filter(([pattern]) => pattern.test(text)).map(([, label]) => label),
  };
}
