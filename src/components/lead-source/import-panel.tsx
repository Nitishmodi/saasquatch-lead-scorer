"use client";

import clsx from "clsx";
import { FileUp, Radar, Upload } from "lucide-react";
import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { parseDomainsCsv } from "@/lib/csv";
import { uniqueDomains } from "@/lib/domain";
import { pluralize } from "@/lib/format";

interface ImportPanelProps {
  disabled: boolean;
  onSubmit: (domains: string[]) => void;
}

const SAMPLE_CSV_URL = "/sample-leads.csv";

function splitEntries(text: string): string[] {
  return text.split(/[\s,;]+/).filter(Boolean);
}

export function ImportPanel({ disabled, onSubmit }: ImportPanelProps) {
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const entries = splitEntries(text);
  const domains = uniqueDomains(entries);
  const removedCount = entries.length - domains.length;
  const canSubmit = !disabled && domains.length > 0;

  async function importCsv(file: File | undefined) {
    if (!file) return;
    const imported = parseDomainsCsv(await file.text());
    setText((current) => [current.trim(), ...imported].filter(Boolean).join("\n"));
  }

  async function loadSample() {
    const response = await fetch(SAMPLE_CSV_URL);
    setText(parseDomainsCsv(await response.text()).join("\n"));
  }

  function submit() {
    if (canSubmit) onSubmit(domains);
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    setDragging(true);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    importCsv(event.dataTransfer.files[0]);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) submit();
  }

  return (
    <>
      <div className="relative p-5" onDragOver={handleDragOver} onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-600">
            Paste websites or drop a SaaSquatch / CRM export. The website column is detected automatically.
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={loadSample} disabled={disabled} className="btn-secondary">
              Try sample list
            </button>
            <button type="button" onClick={() => fileInput.current?.click()} disabled={disabled} className="btn-secondary">
              <Upload className="size-4" />
              Upload CSV
            </button>
            <input
              ref={fileInput}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={(event) => {
                importCsv(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </div>
        </div>

        <textarea
          aria-label="Company websites"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={6}
          spellCheck={false}
          placeholder={"geitzmachine.com\nhttps://www.hardingplumbing.com/about\n…one website per line"}
          className="block w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 p-4 font-mono text-[13px] leading-6 transition outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
        />

        {dragging && (
          <div className="pointer-events-none absolute inset-5 grid place-items-center rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50/90 text-sm font-medium text-emerald-700">
            <span className="flex items-center gap-2">
              <FileUp className="size-5" />
              Drop CSV to import
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={clsx(
              "rounded-full px-2.5 py-1 font-medium",
              domains.length ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-slate-100 text-slate-500",
            )}
          >
            {pluralize(domains.length, "company", "companies")}
          </span>
          {removedCount > 0 && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700 ring-1 ring-amber-100">
              {pluralize(removedCount, "duplicate or invalid entry", "duplicate or invalid entries")} removed
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-sans text-[11px] text-slate-400 sm:inline">
            ⌘ ↵
          </kbd>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className={clsx("btn-primary", disabled && "disabled:opacity-90")}
          >
            <Radar className={clsx("size-4", disabled && "animate-spin")} />
            {disabled ? "Scoring…" : domains.length ? `Score ${domains.length} leads` : "Score leads"}
          </button>
        </div>
      </div>
    </>
  );
}
