import OpenAI from "openai";
import type { CompanyProfile } from "@/lib/types";

const client = process.env.OPENAI_API_KEY ? new OpenAI() : null;
const MODEL = process.env.OPENAI_MODEL ?? "gpt-5-mini";

const INSTRUCTIONS = `You write the first line of a cold email from an acquisition entrepreneur to the owner of a small business.
Write one sentence under 35 words that references something specific about the company.
Be warm and respectful of what the owner built. No flattery cliches, no emojis, no mention of buying or selling.`;

function templateOpener({ name, foundedYear, ownership }: CompanyProfile): string {
  const company = name ?? "your company";
  const intro = foundedYear
    ? `Building ${company} since ${foundedYear} is no small feat`
    : `I've been following the work ${company} is doing`;
  const ownedBy = ownership.length ? `, especially as a ${ownership[0].toLowerCase()} business` : "";
  return `${intro}${ownedBy}. I'd love to hear how you're thinking about the next chapter.`;
}

export async function writeOpener(profile: CompanyProfile): Promise<string | null> {
  if (profile.status !== "ok") return null;
  if (!client) return templateOpener(profile);

  const { name, description, foundedYear, ownership } = profile;
  try {
    const response = await client.responses.create({
      model: MODEL,
      instructions: INSTRUCTIONS,
      input: JSON.stringify({ name, description, foundedYear, ownership }),
    });
    return response.output_text.trim() || templateOpener(profile);
  } catch {
    return templateOpener(profile);
  }
}
