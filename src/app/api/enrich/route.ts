import pLimit from "p-limit";
import { z } from "zod";
import { uniqueDomains } from "@/lib/domain";
import { enrichDomain } from "@/server/enrichment/enrich-domain";

export const maxDuration = 60;

const MAX_BATCH_SIZE = 10;
const CONCURRENCY = 4;

const requestSchema = z.object({
  domains: z.array(z.string()).min(1).max(MAX_BATCH_SIZE),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: `Send between 1 and ${MAX_BATCH_SIZE} domains per request.` }, { status: 400 });
  }

  const limit = pLimit(CONCURRENCY);
  const domains = uniqueDomains(parsed.data.domains);
  const leads = await Promise.all(domains.map((domain) => limit(() => enrichDomain(domain))));

  return Response.json({ leads });
}
