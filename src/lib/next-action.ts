import type { NextAction } from "./types";

export const NEXT_ACTION_LABELS: Record<NextAction, string> = {
  email: "Email the owner",
  call: "Call the main line",
  linkedin: "Reach out on LinkedIn",
  research: "Research manually",
  skip: "Skip, site offline",
};
