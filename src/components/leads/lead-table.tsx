"use client";

import clsx from "clsx";
import { ChevronDown, SearchX } from "lucide-react";
import { Fragment, useState } from "react";
import type { Lead } from "@/lib/types";
import { BestContact } from "./best-contact";
import { CompanyAvatar } from "./company-avatar";
import { LeadDetails } from "./lead-details";
import { NextActionBadge } from "./next-action-badge";
import { ScoreRing } from "./score-ring";

interface LeadTableProps {
  leads: Lead[];
}

interface LeadRowProps {
  lead: Lead;
  expanded: boolean;
  onToggle: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();

const COLUMNS = [
  { label: "Company" },
  { label: "Fit score" },
  { label: "Founded", className: "hidden md:table-cell" },
  { label: "Best contact", className: "hidden lg:table-cell" },
  { label: "Signals", className: "hidden xl:table-cell" },
  { label: "Next step" },
  { label: "" },
];

function LeadRow({ lead, expanded, onToggle }: LeadRowProps) {
  const name = lead.name ?? lead.domain;

  return (
    <tr
      onClick={onToggle}
      aria-expanded={expanded}
      className={clsx(
        "group fade-up cursor-pointer transition-colors hover:bg-emerald-50/40",
        expanded && "bg-emerald-50/40",
      )}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <CompanyAvatar domain={lead.domain} name={name} />
          <div className="min-w-0">
            <p className="max-w-60 truncate font-medium text-slate-900 transition-colors group-hover:text-emerald-700">
              {name}
            </p>
            <p className="text-xs text-slate-500">{lead.domain}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {lead.status === "ok" ? (
          <ScoreRing score={lead.score} tier={lead.tier} />
        ) : (
          <span className="text-xs text-slate-400">{lead.reasons[0]?.label}</span>
        )}
      </td>
      <td className="hidden px-4 py-3 whitespace-nowrap tabular-nums md:table-cell">
        {lead.foundedYear ? (
          <>
            <span className="text-slate-900">{lead.foundedYear}</span>
            <span className="ml-1.5 text-xs text-slate-400">{CURRENT_YEAR - lead.foundedYear} yrs</span>
          </>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="hidden px-4 py-3 lg:table-cell">
        <BestContact lead={lead} />
      </td>
      <td className="hidden px-4 py-3 xl:table-cell">
        <div className="flex flex-wrap gap-1">
          {lead.ownership.map((signal) => (
            <span key={signal} className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-violet-700">
              {signal}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <NextActionBadge action={lead.nextAction} />
      </td>
      <td className="px-4 py-3 text-right">
        <ChevronDown
          className={clsx("size-4 text-slate-400 transition-transform group-hover:text-slate-600", expanded && "rotate-180")}
        />
      </td>
    </tr>
  );
}

export function LeadTable({ leads }: LeadTableProps) {
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  if (leads.length === 0) {
    return (
      <div className="card grid place-items-center gap-2 px-6 py-14 text-center">
        <SearchX className="size-6 text-slate-300" />
        <p className="text-sm font-medium text-slate-700">No leads match these filters</p>
        <p className="text-xs text-slate-500">Try another tier or clear the search.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50/70">
          <tr>
            {COLUMNS.map(({ label, className }) => (
              <th key={label} className={clsx("eyebrow px-4 py-3 font-semibold whitespace-nowrap", className)}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {leads.map((lead) => {
            const expanded = expandedDomain === lead.domain;
            return (
              <Fragment key={lead.domain}>
                <LeadRow
                  lead={lead}
                  expanded={expanded}
                  onToggle={() => setExpandedDomain(expanded ? null : lead.domain)}
                />
                {expanded && (
                  <tr>
                    <td colSpan={COLUMNS.length} className="p-0">
                      <LeadDetails lead={lead} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
