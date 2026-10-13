import Papa from "papaparse";
import { NEXT_ACTION_LABELS } from "./next-action";
import type { Lead } from "./types";

const DOMAIN_COLUMN = /website|domain|url|site/i;

export function parseDomainsCsv(csv: string): string[] {
  const { data, meta } = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  const column = meta.fields?.find((field) => DOMAIN_COLUMN.test(field)) ?? meta.fields?.[0];
  return column ? data.map((row) => row[column]).filter(Boolean) : [];
}

export function downloadLeadsCsv(leads: Lead[]) {
  const url = URL.createObjectURL(new Blob([leadsToCsv(leads)], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `saasquatch-scored-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function leadsToCsv(leads: Lead[]): string {
  return Papa.unparse(
    leads.map((lead) => ({
      "Company name": lead.name ?? lead.domain,
      "Website URL": lead.url ?? `https://${lead.domain}`,
      Email: lead.emails[0] ?? "",
      "Phone Number": lead.phones[0] ?? "",
      "LinkedIn Company Page": lead.socials.linkedin ?? "",
      "Year Founded": lead.foundedYear ?? "",
      "Domain Registered": lead.domainRegisteredYear ?? "",
      "Ownership Signals": lead.ownership.join("; "),
      "Lead Score": lead.score,
      "Lead Tier": lead.tier,
      "Next Action": NEXT_ACTION_LABELS[lead.nextAction],
      "Score Reasons": lead.reasons.map((reason) => reason.label).join("; "),
      "Outreach Opener": lead.opener ?? "",
    })),
  );
}
