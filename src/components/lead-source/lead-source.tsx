"use client";

import clsx from "clsx";
import { Compass, ListPlus, Upload, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { DiscoverPanel } from "./discover-panel";
import { ImportPanel } from "./import-panel";

type SourceMode = "discover" | "import";

interface LeadSourceProps {
  disabled: boolean;
  onSubmit: (domains: string[]) => void;
}

interface SourceTabsProps {
  mode: SourceMode;
  onChange: (mode: SourceMode) => void;
}

const MODES: { value: SourceMode; label: string; icon: LucideIcon }[] = [
  { value: "discover", label: "Discover companies", icon: Compass },
  { value: "import", label: "Import a list", icon: Upload },
];

function SourceTabs({ mode, onChange }: SourceTabsProps) {
  return (
    <div className="flex rounded-xl bg-slate-100/80 p-1 ring-1 ring-slate-200/60" role="tablist" aria-label="Lead source">
      {MODES.map(({ value, label, icon: Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(value)}
            className={clsx(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition duration-200",
              active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800",
            )}
          >
            <Icon className={clsx("size-4 transition", active && "text-emerald-600")} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function LeadSource({ disabled, onSubmit }: LeadSourceProps) {
  const [mode, setMode] = useState<SourceMode>("discover");
  const Panel = mode === "discover" ? DiscoverPanel : ImportPanel;

  return (
    <section className="relative isolate">
      <div
        aria-hidden
        className="absolute -inset-x-6 -inset-y-4 -z-10 rounded-[2rem] bg-linear-to-r from-emerald-300/25 via-teal-200/20 to-sky-300/25 blur-2xl"
      />

      <div className="card gradient-border overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/25">
              <ListPlus className="size-4.5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Build your target list</h2>
              <p className="text-xs text-slate-500">Find new companies or score a list you already have.</p>
            </div>
          </div>
          <SourceTabs mode={mode} onChange={setMode} />
        </div>

        <div key={mode} className="fade-up">
          <Panel disabled={disabled} onSubmit={onSubmit} />
        </div>
      </div>
    </section>
  );
}
