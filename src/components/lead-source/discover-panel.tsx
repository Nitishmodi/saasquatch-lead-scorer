"use client";

import clsx from "clsx";
import { AlertCircle, ChevronDown, Compass, MapPin, Store } from "lucide-react";
import { useState, type FormEvent } from "react";
import { errorMessage, postJson } from "@/lib/api-client";
import { findIndustry, INDUSTRIES } from "@/lib/industries";
import type { DiscoveryResult } from "@/lib/types";

interface DiscoverPanelProps {
  disabled: boolean;
  onSubmit: (domains: string[]) => void;
}

const SUGGESTED_LOCATIONS = ["Columbus, OH", "Cleveland, OH", "Grand Rapids, MI", "Austin, TX"];
const FIELD_ICON_CLASS =
  "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-emerald-500";

function shortPlaceName(displayName: string): string {
  return displayName.split(",").slice(0, 2).join(",");
}

export function DiscoverPanel({ disabled, onSubmit }: DiscoverPanelProps) {
  const [industryId, setIndustryId] = useState(INDUSTRIES[0].id);
  const [location, setLocation] = useState("");
  const [searching, setSearching] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = disabled || searching;
  const industryLabel = findIndustry(industryId).label.toLowerCase();

  async function discover(event: FormEvent) {
    event.preventDefault();
    setSearching(true);
    setError(null);
    setSummary(null);

    try {
      const result = await postJson<DiscoveryResult>(
        "/api/discover",
        { industry: industryId, location },
        "Discovery failed.",
      );
      const area = shortPlaceName(result.location);
      if (result.companies.length === 0) {
        throw new Error(`No independent ${industryLabel} businesses with websites found near ${area}. Try a nearby city.`);
      }

      const excluded = result.chainsExcluded
        ? ` · ${result.chainsExcluded} chains and multi-location brands excluded`
        : "";
      setSummary(`Found ${result.companies.length} independent ${industryLabel} businesses near ${area}${excluded}`);
      onSubmit(result.companies.map((company) => company.domain));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSearching(false);
    }
  }

  return (
    <form onSubmit={discover}>
      <div className="space-y-4 p-5">
        <p className="text-sm text-slate-600">
          Pick an industry and a city. We find independent businesses with websites within 40 km, skip national chains,
          then score every one.
        </p>

        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className="group relative">
            <span className="sr-only">Industry</span>
            <Store className={FIELD_ICON_CLASS} />
            <select
              value={industryId}
              onChange={(event) => setIndustryId(event.target.value)}
              className="field appearance-none py-2.5 pr-9 pl-10"
            >
              {INDUSTRIES.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400" />
          </label>

          <label className="group relative">
            <span className="sr-only">Location</span>
            <MapPin className={FIELD_ICON_CLASS} />
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="City, state (e.g. Columbus, OH)"
              required
              minLength={2}
              className="field py-2.5 pr-3 pl-10"
            />
          </label>

          <button type="submit" disabled={busy || location.trim().length < 2} className="btn-primary">
            <Compass className={clsx("size-4", busy && "animate-spin")} />
            {searching ? "Searching…" : disabled ? "Scoring…" : "Find & score"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Try:</span>
          {SUGGESTED_LOCATIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setLocation(suggestion)}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-600 transition hover:-translate-y-px hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-12 flex-wrap items-center gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs">
        {error ? (
          <span className="flex items-center gap-1.5 font-medium text-rose-600">
            <AlertCircle className="size-4" />
            {error}
          </span>
        ) : summary ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 ring-1 ring-emerald-100">
            {summary}
          </span>
        ) : (
          <span className="text-slate-400">Results are scored automatically as soon as they are found.</span>
        )}
      </div>
    </form>
  );
}
