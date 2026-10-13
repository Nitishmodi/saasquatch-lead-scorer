import type { Lead, Tier } from "./types";

export type TierFilter = Tier | "all";

export interface LeadFilterState {
  tier: TierFilter;
  contactableOnly: boolean;
  query: string;
}

export const DEFAULT_FILTERS: LeadFilterState = { tier: "all", contactableOnly: false, query: "" };

function matchesFilters(lead: Lead, { tier, contactableOnly, query }: LeadFilterState): boolean {
  const search = query.trim().toLowerCase();
  return (
    (tier === "all" || lead.tier === tier) &&
    (!contactableOnly || lead.emails.length > 0 || lead.phones.length > 0) &&
    (!search || `${lead.name} ${lead.domain}`.toLowerCase().includes(search))
  );
}

export function filterLeads(leads: Lead[], filters: LeadFilterState): Lead[] {
  return leads.filter((lead) => matchesFilters(lead, filters)).sort((a, b) => b.score - a.score);
}

export function countByTier(leads: Lead[]): Record<TierFilter, number> {
  const count = (tier: Tier) => leads.filter((lead) => lead.tier === tier).length;
  return { all: leads.length, hot: count("hot"), warm: count("warm"), cold: count("cold") };
}
