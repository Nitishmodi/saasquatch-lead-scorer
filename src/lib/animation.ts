import type { CSSProperties } from "react";

export function animationDelay(ms: number): CSSProperties {
  return { "--delay": `${ms}ms` } as CSSProperties;
}
