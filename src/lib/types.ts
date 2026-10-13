export type CrawlStatus = "ok" | "unreachable" | "blocked" | "protected";

export type Social = "linkedin" | "facebook" | "instagram" | "x" | "youtube";

export interface CompanyProfile {
  domain: string;
  url: string | null;
  status: CrawlStatus;
  name: string | null;
  description: string | null;
  emails: string[];
  emailDeliverable: boolean;
  phones: string[];
  socials: Partial<Record<Social, string>>;
  foundedYear: number | null;
  domainRegisteredYear: number | null;
  copyrightYear: number | null;
  platform: string | null;
  ownership: string[];
  opener: string | null;
}

export type Tier = "hot" | "warm" | "cold";

export interface ScoreReason {
  label: string;
  points: number;
}

export type NextAction = "email" | "call" | "linkedin" | "research" | "skip";

export interface Lead extends CompanyProfile {
  score: number;
  tier: Tier;
  reasons: ScoreReason[];
  nextAction: NextAction;
  cached: boolean;
  enrichedAt: string;
}

export interface DiscoveredCompany {
  name: string;
  domain: string;
}

export interface DiscoveryResult {
  location: string;
  companies: DiscoveredCompany[];
  chainsExcluded: number;
}
