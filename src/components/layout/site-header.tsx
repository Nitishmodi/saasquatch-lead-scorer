import { ArrowUpRight } from "lucide-react";
import { REPO_URL } from "@/lib/site";
import { BrandMark } from "./brand-mark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <BrandMark />
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
        >
          Source
          <ArrowUpRight className="size-3.5" />
        </a>
      </div>
      <div className="h-px bg-linear-to-r from-transparent via-emerald-400/50 to-transparent" />
    </header>
  );
}
