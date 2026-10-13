import { setTimeout as sleep } from "node:timers/promises";
import * as cheerio from "cheerio";
import robotsParser from "robots-parser";
import { USER_AGENT } from "@/lib/site";
import type { CrawlStatus } from "@/lib/types";

const TIMEOUT_MS = 8_000;
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 1_000;
const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);
const CHALLENGE_HEADERS = ["cf-mitigated", "x-amzn-waf-action"];
const MAX_SUBPAGES = 3;
const SUBPAGE_PATTERN = /about|contact|story|history|team|company/i;

export interface Page {
  url: string;
  html: string;
}

interface CrawlResult {
  status: CrawlStatus;
  pages: Page[];
}

type PageResult = Page | "protected" | null;

async function request(url: string, attempt = 1): Promise<Response | null> {
  try {
    const response = await fetch(url, {
      headers: { "user-agent": USER_AGENT, accept: "text/html,text/plain;q=0.9" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (RETRYABLE_STATUS.has(response.status) && attempt < MAX_ATTEMPTS) {
      await sleep(Number(response.headers.get("retry-after")) * 1000 || RETRY_DELAY_MS * attempt);
      return request(url, attempt + 1);
    }
    return response;
  } catch {
    return null;
  }
}

function isBotChallenge(response: Response): boolean {
  const server = response.headers.get("server") ?? "";
  return (
    CHALLENGE_HEADERS.some((header) => response.headers.has(header)) ||
    (response.status === 403 && /cloudflare|akamai|sucuri/i.test(server))
  );
}

async function fetchPage(url: string): Promise<PageResult> {
  const response = await request(url);
  if (!response) return null;
  if (isBotChallenge(response)) return "protected";
  if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return null;
  return { url: response.url, html: await response.text() };
}

async function loadRobots(domain: string) {
  const response = await request(`https://${domain}/robots.txt`);
  const ok = response?.ok === true;
  const url = ok ? response.url : `https://${domain}/robots.txt`;
  return { origin: new URL(url).origin, rules: robotsParser(url, ok ? await response.text() : "") };
}

function findSubpages(home: Page): string[] {
  const $ = cheerio.load(home.html);
  const { hostname } = new URL(home.url);
  const urls = new Set<string>();

  $("a[href]").each((_, anchor) => {
    try {
      const url = new URL($(anchor).attr("href")!, home.url);
      url.hash = "";
      if (url.hostname === hostname && url.href !== home.url && SUBPAGE_PATTERN.test(url.pathname)) {
        urls.add(url.href);
      }
    } catch {
      // Ignore malformed hrefs.
    }
  });

  return [...urls].slice(0, MAX_SUBPAGES);
}

export async function crawlSite(domain: string): Promise<CrawlResult> {
  const robots = await loadRobots(domain);
  const isAllowed = (url: string) => robots.rules.isAllowed(url, USER_AGENT) !== false;

  if (!isAllowed(`${robots.origin}/`)) return { status: "blocked", pages: [] };

  let home: Page | null = null;
  for (const url of [`${robots.origin}/`, `https://www.${domain}/`, `http://${domain}/`]) {
    const result = await fetchPage(url);
    if (result === "protected") return { status: "protected", pages: [] };
    if (result) {
      home = result;
      break;
    }
  }
  if (!home) return { status: "unreachable", pages: [] };

  const subpages = await Promise.all(findSubpages(home).filter(isAllowed).map(fetchPage));
  const pages = subpages.filter((page): page is Page => page !== null && page !== "protected");
  return { status: "ok", pages: [home, ...pages] };
}
