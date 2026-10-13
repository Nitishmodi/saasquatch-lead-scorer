import { setTimeout as sleep } from "node:timers/promises";
import { normalizeDomain } from "@/lib/domain";
import type { Industry } from "@/lib/industries";
import { USER_AGENT } from "@/lib/site";
import type { DiscoveryResult } from "@/lib/types";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_MIRRORS = [
  { url: "https://overpass-api.de/api/interpreter", timeoutMs: 20_000 },
  { url: "https://overpass.private.coffee/api/interpreter", timeoutMs: 12_000 },
];
const SEARCH_RADIUS_M = 40_000;
const MAX_COMPANIES = 30;
const WEBSITE_KEYS = ["website", "contact:website"];
const NON_COMPANY_HOSTS = /(^|\.)(facebook|instagram|yelp|google|linktr|wixsite|business\.site)\./;

interface OsmElement {
  tags?: Record<string, string>;
}

interface Place {
  lat: number;
  lon: number;
  label: string;
}

export class DiscoveryError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function geocode(location: string): Promise<Place> {
  const url = `${NOMINATIM_URL}?${new URLSearchParams({ q: location, format: "jsonv2", limit: "1" })}`;
  const response = await fetch(url, { headers: { "user-agent": USER_AGENT }, signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new DiscoveryError("Location lookup is unavailable right now.", 502);

  const [place] = (await response.json()) as { lat: string; lon: string; display_name: string }[];
  if (!place) throw new DiscoveryError(`Couldn't find "${location}". Try a city and state, like "Cleveland, OH".`, 404);
  return { lat: Number(place.lat), lon: Number(place.lon), label: place.display_name };
}

async function queryOverpass(query: string): Promise<OsmElement[]> {
  for (const [index, { url, timeoutMs }] of OVERPASS_MIRRORS.entries()) {
    if (index > 0) await sleep(500);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "user-agent": USER_AGENT, "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.ok) return ((await response.json()) as { elements: OsmElement[] }).elements;
    } catch {
      continue;
    }
  }
  throw new DiscoveryError("The business directory is busy. Try again in a few seconds.", 503);
}

function buildQuery(industry: Industry, { lat, lon }: Place): string {
  const statements = industry.selectors.flatMap((selector) =>
    WEBSITE_KEYS.map((key) => `nwr(around:${SEARCH_RADIUS_M},${lat},${lon})${selector}["${key}"];`),
  );
  return `[out:json][timeout:25];(${statements.join("")});out tags 300;`;
}

export async function discoverCompanies(industry: Industry, location: string): Promise<DiscoveryResult> {
  const place = await geocode(location);
  const elements = await queryOverpass(buildQuery(industry, place));

  const byDomain = new Map<string, { name: string; locations: number; branded: boolean }>();
  for (const { tags = {} } of elements) {
    const domain = normalizeDomain(tags.website ?? tags["contact:website"] ?? "");
    if (!domain || !tags.name || NON_COMPANY_HOSTS.test(`.${domain}`)) continue;

    const existing = byDomain.get(domain);
    byDomain.set(domain, {
      name: existing?.name ?? tags.name,
      locations: (existing?.locations ?? 0) + 1,
      branded: Boolean(existing?.branded || tags.brand || tags["brand:wikidata"]),
    });
  }

  const entries = [...byDomain.entries()];
  const independents = entries.filter(([, entry]) => !entry.branded && entry.locations === 1);

  return {
    location: place.label,
    companies: independents.slice(0, MAX_COMPANIES).map(([domain, { name }]) => ({ domain, name })),
    chainsExcluded: entries.length - independents.length,
  };
}
