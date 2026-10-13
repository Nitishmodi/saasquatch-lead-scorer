"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LeadSource } from "@/components/lead-source/lead-source";
import { useLeadScoring } from "@/hooks/use-lead-scoring";
import { downloadLeadsCsv } from "@/lib/csv";
import { countByTier, DEFAULT_FILTERS, filterLeads } from "@/lib/lead-filters";
import { LeadFilters } from "./lead-filters";
import { LeadTable } from "./lead-table";
import { PipelineSummary } from "./pipeline-summary";
import { ScoringProgress } from "./scoring-progress";

export function LeadWorkspace() {
  const { leads, progress, running, error, scoreDomains } = useLeadScoring();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const visibleLeads = filterLeads(leads, filters);

  return (
    <div className="space-y-5">
      <LeadSource disabled={running} onSubmit={scoreDomains} />

      {running && <ScoringProgress done={progress.done} total={progress.total} />}

      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      {leads.length > 0 ? (
        <div className="fade-up space-y-5">
          <PipelineSummary leads={leads} />
          <LeadFilters
            filters={filters}
            tierCounts={countByTier(leads)}
            visibleCount={visibleLeads.length}
            onChange={setFilters}
            onExport={() => downloadLeadsCsv(visibleLeads)}
          />
          <LeadTable leads={visibleLeads} />
        </div>
      ) : (
        !running && <HowItWorks />
      )}
    </div>
  );
}
