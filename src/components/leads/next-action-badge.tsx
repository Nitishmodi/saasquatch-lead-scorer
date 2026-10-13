import clsx from "clsx";
import { Ban, Mail, Phone, Search, UserRoundSearch, type LucideIcon } from "lucide-react";
import { NEXT_ACTION_LABELS } from "@/lib/next-action";
import type { NextAction } from "@/lib/types";

const NEXT_ACTION_STYLES: Record<NextAction, { icon: LucideIcon; tone: string }> = {
  email: { icon: Mail, tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  call: { icon: Phone, tone: "bg-sky-50 text-sky-700 ring-sky-200" },
  linkedin: { icon: UserRoundSearch, tone: "bg-indigo-50 text-indigo-700 ring-indigo-200" },
  research: { icon: Search, tone: "bg-slate-50 text-slate-600 ring-slate-200" },
  skip: { icon: Ban, tone: "bg-rose-50 text-rose-600 ring-rose-200" },
};

export function NextActionBadge({ action }: { action: NextAction }) {
  const { icon: Icon, tone } = NEXT_ACTION_STYLES[action];

  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium whitespace-nowrap ring-1", tone)}>
      <Icon className="size-3.5" />
      {NEXT_ACTION_LABELS[action]}
    </span>
  );
}
