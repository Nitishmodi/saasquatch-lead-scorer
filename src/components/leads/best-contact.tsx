import clsx from "clsx";
import { Mail, MailCheck, Phone } from "lucide-react";
import type { Lead } from "@/lib/types";

export function BestContact({ lead }: { lead: Lead }) {
  const [email] = lead.emails;
  const [phone] = lead.phones;

  if (email) {
    const Icon = lead.emailDeliverable ? MailCheck : Mail;
    return (
      <span className="flex max-w-56 items-center gap-1.5 text-slate-700">
        <Icon className={clsx("size-4 shrink-0", lead.emailDeliverable ? "text-emerald-500" : "text-slate-400")} />
        <span className="truncate">{email}</span>
      </span>
    );
  }

  if (phone) {
    return (
      <span className="flex items-center gap-1.5 whitespace-nowrap text-slate-700">
        <Phone className="size-4 shrink-0 text-slate-400" />
        {phone}
      </span>
    );
  }

  return <span className="text-slate-300">—</span>;
}
