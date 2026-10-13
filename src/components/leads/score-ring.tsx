import clsx from "clsx";
import type { Tier } from "@/lib/types";

const RADIUS = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TIER_STYLES: Record<Tier, { ring: string; badge: string; dot: string }> = {
  hot: { ring: "stroke-emerald-500", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  warm: { ring: "stroke-amber-400", badge: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-400" },
  cold: { ring: "stroke-slate-300", badge: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
};

interface ScoreRingProps {
  score: number;
  tier: Tier;
}

export function ScoreRing({ score, tier }: ScoreRingProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative size-10">
        <svg viewBox="0 0 40 40" className="size-10 -rotate-90">
          <circle cx="20" cy="20" r={RADIUS} fill="none" strokeWidth="4" className="stroke-slate-100" />
          <circle
            cx="20"
            cy="20"
            r={RADIUS}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - score / 100)}
            className={clsx("transition-[stroke-dashoffset] duration-700", TIER_STYLES[tier].ring)}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-xs font-semibold tabular-nums">{score}</span>
      </div>
      <span
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1",
          TIER_STYLES[tier].badge,
        )}
      >
        <span className={clsx("size-1.5 rounded-full", TIER_STYLES[tier].dot)} />
        {tier}
      </span>
    </div>
  );
}
