"use client";

import { useState } from "react";
import { errorMessage, postJson } from "@/lib/api-client";
import type { Lead } from "@/lib/types";

const BATCH_SIZE = 5;

function chunk<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );
}

export function useLeadScoring() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function scoreDomains(domains: string[]) {
    setRunning(true);
    setError(null);
    setLeads([]);
    setProgress({ done: 0, total: domains.length });

    try {
      for (const batch of chunk(domains, BATCH_SIZE)) {
        const { leads: scored } = await postJson<{ leads: Lead[] }>(
          "/api/enrich",
          { domains: batch },
          "Enrichment failed.",
        );
        setLeads((current) => [...current, ...scored]);
        setProgress((current) => ({ ...current, done: current.done + batch.length }));
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setRunning(false);
    }
  }

  return { leads, progress, running, error, scoreDomains };
}
