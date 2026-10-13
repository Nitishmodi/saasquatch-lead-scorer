import { resolveMx } from "node:dns/promises";

export async function hasMailServer(domain: string): Promise<boolean> {
  try {
    const records = await resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}
