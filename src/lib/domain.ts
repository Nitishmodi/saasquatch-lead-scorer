const HOSTNAME_PATTERN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

export function normalizeDomain(input: string): string | null {
  const value = input.trim().toLowerCase();
  if (!value) return null;

  try {
    const { hostname } = new URL(value.includes("://") ? value : `https://${value}`);
    const domain = hostname.replace(/^www\./, "");
    return HOSTNAME_PATTERN.test(domain) ? domain : null;
  } catch {
    return null;
  }
}

export function uniqueDomains(inputs: string[]): string[] {
  const domains = inputs.map(normalizeDomain).filter((domain) => domain !== null);
  return [...new Set(domains)];
}
