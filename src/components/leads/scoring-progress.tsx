import { Loader2 } from "lucide-react";

interface ScoringProgressProps {
  done: number;
  total: number;
}

export function ScoringProgress({ done, total }: ScoringProgressProps) {
  const percent = total ? (done / total) * 100 : 0;

  return (
    <div className="card fade-up flex items-center gap-4 px-5 py-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
        <Loader2 className="size-5 animate-spin text-emerald-600" />
      </span>
      <div className="flex-1">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-slate-700">Crawling, verifying, and scoring…</span>
          <span className="text-slate-500 tabular-nums">
            {done} / {total}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="shimmer h-full rounded-full bg-[linear-gradient(90deg,#10b981,#14b8a6,#34d399,#10b981)] transition-[width] duration-500"
            style={{ width: `${Math.max(percent, 4)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
