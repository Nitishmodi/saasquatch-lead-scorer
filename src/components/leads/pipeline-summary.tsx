import { Building2, Flame, Gauge, MailCheck, Zap, type LucideIcon } from "lucide-react";
import { animationDelay } from "@/lib/animation";
import type { Lead } from "@/lib/types";

interface PipelineSummaryProps {
  leads: Lead[];
}

interface Stat {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone: string;
}

function buildStats(leads: Lead[]): Stat[] {
  const count = (predicate: (lead: Lead) => boolean) => leads.filter(predicate).length;
  const share = (value: number) => (leads.length ? Math.round((value / leads.length) * 100) : 0);

  const reachable = leads.filter((lead) => lead.status === "ok");
  const hot = count((lead) => lead.tier === "hot");
  const averageScore = reachable.length
    ? Math.round(reachable.reduce((total, lead) => total + lead.score, 0) / reachable.length)
    : 0;

  return [
    {
      label: "Companies scouted",
      value: leads.length,
      hint: `${reachable.length} reachable`,
      icon: Building2,
      tone: "bg-slate-100 text-slate-600 ring-slate-200",
    },
    {
      label: "Hot leads",
      value: hot,
      hint: `${share(hot)}% of pipeline`,
      icon: Flame,
      tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    },
    {
      label: "Deliverable emails",
      value: count((lead) => lead.emailDeliverable),
      hint: "MX record verified",
      icon: MailCheck,
      tone: "bg-sky-50 text-sky-600 ring-sky-100",
    },
    {
      label: "Average fit",
      value: averageScore,
      hint: "across reachable sites",
      icon: Gauge,
      tone: "bg-amber-50 text-amber-600 ring-amber-100",
    },
    {
      label: "Served from cache",
      value: count((lead) => lead.cached),
      hint: "instant, no re-crawl",
      icon: Zap,
      tone: "bg-violet-50 text-violet-600 ring-violet-100",
    },
  ];
}

export function PipelineSummary({ leads }: PipelineSummaryProps) {
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {buildStats(leads).map(({ label, value, hint, icon: Icon, tone }, index) => (
        <div key={label} className="card card-hover group fade-up p-4" style={animationDelay(index * 60)}>
          <div className="flex items-center justify-between">
            <dt className="text-xs font-medium text-slate-500">{label}</dt>
            <span className={`grid size-8 place-items-center rounded-lg ring-1 transition group-hover:scale-110 ${tone}`}>
              <Icon className="size-4" />
            </span>
          </div>
          <dd className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</dd>
          <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
        </div>
      ))}
    </dl>
  );
}
