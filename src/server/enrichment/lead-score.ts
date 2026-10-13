import type { CompanyProfile, CrawlStatus, Lead, NextAction, ScoreReason, Tier } from "@/lib/types";

type LeadScore = Pick<Lead, "score" | "tier" | "reasons" | "nextAction">;

const CURRENT_YEAR = new Date().getFullYear();
const HOT_THRESHOLD = 65;
const WARM_THRESHOLD = 40;

const UNAVAILABLE_LABELS: Record<Exclude<CrawlStatus, "ok">, string> = {
  blocked: "Site disallows crawling (robots.txt)",
  protected: "Behind bot protection (CAPTCHA), verify manually",
  unreachable: "Website unreachable",
};

function scoreReasons(profile: CompanyProfile): ScoreReason[] {
  const reasons: ScoreReason[] = [];
  const add = (points: number, label: string) => reasons.push({ points, label });

  const age = profile.foundedYear ? CURRENT_YEAR - profile.foundedYear : null;
  const domainAge = profile.domainRegisteredYear ? CURRENT_YEAR - profile.domainRegisteredYear : null;
  if (age !== null && age >= 25) add(25, `Founded ${profile.foundedYear} (${age} yrs): likely succession window`);
  else if (age !== null && age >= 10) add(15, `Founded ${profile.foundedYear} (${age} yrs): proven, durable business`);
  else if (age === null && domainAge !== null && domainAge >= 15) {
    add(10, `Domain registered ${profile.domainRegisteredYear}: long-standing web presence`);
  }

  if (profile.ownership.length) add(20, `${profile.ownership.join(", ")}: direct line to the decision-maker`);

  if (profile.emails.length && profile.emailDeliverable) add(25, "Email found and domain accepts mail");
  else if (profile.emails.length) add(10, "Email found, but no mail server on its domain");

  if (profile.phones.length) add(10, "Direct phone number listed");
  if (profile.socials.linkedin) add(10, "LinkedIn page for owner research");

  if (profile.copyrightYear && CURRENT_YEAR - profile.copyrightYear >= 2) {
    add(10, `Website untouched since ~${profile.copyrightYear}: digital upside post-acquisition`);
  }

  return reasons;
}

function pickNextAction(profile: CompanyProfile, tier: Tier): NextAction {
  if (profile.status === "unreachable") return "skip";
  if (profile.status !== "ok" || tier === "cold") return "research";
  if (profile.emails.length && profile.emailDeliverable) return "email";
  if (profile.phones.length) return "call";
  if (profile.socials.linkedin) return "linkedin";
  return "research";
}

export function scoreProfile(profile: CompanyProfile): LeadScore {
  if (profile.status !== "ok") {
    return {
      score: 0,
      tier: "cold",
      reasons: [{ label: UNAVAILABLE_LABELS[profile.status], points: 0 }],
      nextAction: pickNextAction(profile, "cold"),
    };
  }

  const reasons = scoreReasons(profile);
  const score = Math.min(100, reasons.reduce((total, reason) => total + reason.points, 0));
  const tier: Tier = score >= HOT_THRESHOLD ? "hot" : score >= WARM_THRESHOLD ? "warm" : "cold";
  return { score, tier, reasons, nextAction: pickNextAction(profile, tier) };
}
