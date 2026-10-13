import { ArrowUpRight } from "lucide-react";
import { REPO_URL } from "@/lib/site";
import { BrandMark } from "./brand-mark";

const LINKS = [
  { label: "Source code", href: REPO_URL },
  { label: "SaaSquatch Leads", href: "https://www.saasquatchleads.com/" },
  { label: "Caprae Capital", href: "https://capraecapital.com/" },
];

const DATA_SOURCES = ["Company websites", "OpenStreetMap", "RDAP registry", "DNS MX records"];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-slate-200/70 bg-white/60 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/50 to-transparent" />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <BrandMark />
          <p className="max-w-sm text-sm leading-relaxed text-slate-500">
            Find, verify, and rank independent businesses by acquisition fit, so searchers spend their time on the owners
            worth calling.
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="eyebrow">Links</p>
          <ul className="mt-3 space-y-2 text-sm">
            {LINKS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-1 text-slate-600 transition hover:text-emerald-700"
                >
                  {label}
                  <ArrowUpRight className="size-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow">Data sources</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {DATA_SOURCES.map((source) => (
              <li
                key={source}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
              >
                {source}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>Built for the Caprae Capital × SaaSquatch Leads challenge</p>
          <p>
            Business data ©{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-slate-300 underline-offset-2 transition hover:text-emerald-700 hover:decoration-emerald-400"
            >
              OpenStreetMap contributors
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
