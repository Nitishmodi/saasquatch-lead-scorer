import clsx from "clsx";
import { Download, PhoneCall, Search } from "lucide-react";
import type { LeadFilterState, TierFilter } from "@/lib/lead-filters";

interface LeadFiltersProps {
  filters: LeadFilterState;
  tierCounts: Record<TierFilter, number>;
  visibleCount: number;
  onChange: (filters: LeadFilterState) => void;
  onExport: () => void;
}

interface TierOption {
  value: TierFilter;
  label: string;
  dot?: string;
}

const TIER_OPTIONS: TierOption[] = [
  { value: "all", label: "All" },
  { value: "hot", label: "Hot", dot: "bg-emerald-500" },
  { value: "warm", label: "Warm", dot: "bg-amber-400" },
  { value: "cold", label: "Cold", dot: "bg-slate-300" },
];

export function LeadFilters({ filters, tierCounts, visibleCount, onChange, onExport }: LeadFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm" role="radiogroup" aria-label="Lead tier">
        {TIER_OPTIONS.map(({ value, label, dot }) => {
          const active = filters.tier === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange({ ...filters, tier: value })}
              className={clsx(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                active ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {dot && <span className={clsx("size-1.5 rounded-full", dot)} />}
              {label}
              <span className={clsx("tabular-nums text-xs", active ? "text-slate-300" : "text-slate-400")}>
                {tierCounts[value]}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        aria-pressed={filters.contactableOnly}
        onClick={() => onChange({ ...filters, contactableOnly: !filters.contactableOnly })}
        className={clsx(
          "btn-secondary",
          filters.contactableOnly && "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
        )}
      >
        <PhoneCall className="size-4" />
        Contactable only
      </button>

      <label className="relative min-w-52 flex-1">
        <span className="sr-only">Search leads</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Search company or domain"
          className="field py-2 pr-3 pl-9"
        />
      </label>

      <button type="button" onClick={onExport} disabled={visibleCount === 0} className="btn-primary">
        <Download className="size-4" />
        Export CSV ({visibleCount})
      </button>
    </div>
  );
}
