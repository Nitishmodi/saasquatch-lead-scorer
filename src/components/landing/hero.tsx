import { CheckCircle2 } from "lucide-react";
import { animationDelay } from "@/lib/animation";

const HIGHLIGHTS = ["Chains filtered out", "MX-verified emails", "Explainable scores", "CRM-ready export"];

export function Hero() {
  return (
    <section className="mx-auto max-w-3xl pt-14 pb-12 text-center sm:pt-20">
      <span className="fade-up inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/70 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm backdrop-blur">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        Acquisition intelligence for searchers
      </span>

      <h1 className="fade-up mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl" style={animationDelay(80)}>
        Find the owners ready for <span className="text-gradient">their next chapter</span>
      </h1>

      <p className="fade-up mx-auto mt-5 max-w-2xl text-base text-pretty text-slate-600 sm:text-lg" style={animationDelay(160)}>
        Discover independent businesses or drop in a lead list. Every website is crawled, every contact verified, and
        every company ranked by acquisition fit, so you spend your morning on the five best owners instead of five
        hundred rows.
      </p>

      <ul className="fade-up mt-7 flex flex-wrap justify-center gap-2 text-sm text-slate-600" style={animationDelay(240)}>
        {HIGHLIGHTS.map((highlight) => (
          <li
            key={highlight}
            className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/60 px-3 py-1 shadow-sm backdrop-blur"
          >
            <CheckCircle2 className="size-4 text-emerald-500" />
            {highlight}
          </li>
        ))}
      </ul>
    </section>
  );
}
