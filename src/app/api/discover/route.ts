import { z } from "zod";
import { findIndustry, INDUSTRY_IDS } from "@/lib/industries";
import { DiscoveryError, discoverCompanies } from "@/server/discovery";

export const maxDuration = 45;

const requestSchema = z.object({
  industry: z.enum(INDUSTRY_IDS),
  location: z.string().trim().min(2).max(100),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Pick an industry and enter a location." }, { status: 400 });
  }

  try {
    return Response.json(await discoverCompanies(findIndustry(parsed.data.industry), parsed.data.location));
  } catch (error) {
    if (error instanceof DiscoveryError) return Response.json({ error: error.message }, { status: error.status });
    throw error;
  }
}
