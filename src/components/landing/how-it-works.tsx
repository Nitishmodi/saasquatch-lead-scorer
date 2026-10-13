import { Compass, Globe, ShieldCheck, Trophy, type LucideIcon } from "lucide-react";
import { animationDelay } from "@/lib/animation";

interface Step {
  title: string;
  body: string;
  icon: LucideIcon;
  tone: string;
}

const STEPS: Step[] = [
  {
    title: "Discover",
    body: "Finds independent businesses by industry and city, or imports your existing list. National chains are filtered out.",
    icon: Compass,
    tone: "from-emerald-500 to-teal-600 shadow-emerald-600/25",
  },
  {
    title: "Crawl",
    body: "Reads each homepage plus its about and contact pages, respects robots.txt, and flags CAPTCHA walls.",
    icon: Globe,
    tone: "from-sky-500 to-blue-600 shadow-sky-600/25",
  },
  {
    title: "Verify",
    body: "Deduplicates companies, validates phones, checks email MX records, and pulls domain age from RDAP.",
    icon: ShieldCheck,
    tone: "from-violet-500 to-indigo-600 shadow-violet-600/25",
  },
  {
    title: "Rank",
    body: "Scores acquisition fit on age, ownership, reachability, and digital upside, then suggests the next step.",
    icon: Trophy,
    tone: "from-amber-400 to-orange-500 shadow-amber-500/25",
  },
];

export function HowItWorks() {
  return (
    <ol className="grid gap-4 pt-3 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map(({ title, body, icon: Icon, tone }, index) => (
        <li key={title} className="card card-hover group fade-up p-5" style={animationDelay(400 + index * 80)}>
          <div className="flex items-center gap-3">
            <span
              className={`grid size-10 place-items-center rounded-xl bg-linear-to-br text-white shadow-md transition group-hover:scale-110 ${tone}`}
            >
              <Icon className="size-4.5" />
            </span>
            <div>
              <p className="eyebrow">Step {index + 1}</p>
              <p className="font-semibold">{title}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>
        </li>
      ))}
    </ol>
  );
}
