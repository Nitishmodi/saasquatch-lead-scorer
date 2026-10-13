import { USER_AGENT } from "@/lib/site";

const RDAP_ENDPOINT = "https://rdap.org/domain/";
const TIMEOUT_MS = 5_000;

interface RdapResponse {
  events?: { eventAction: string; eventDate: string }[];
}

export async function getDomainRegistrationYear(domain: string): Promise<number | null> {
  try {
    const response = await fetch(`${RDAP_ENDPOINT}${domain}`, {
      headers: { accept: "application/rdap+json", "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;

    const { events = [] } = (await response.json()) as RdapResponse;
    const registered = events.find((event) => event.eventAction === "registration")?.eventDate;
    return registered ? new Date(registered).getUTCFullYear() : null;
  } catch {
    return null;
  }
}
