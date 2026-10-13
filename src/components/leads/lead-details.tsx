"use client";

import { Check, Copy, Globe, Mail, MailCheck, Phone, Send } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Lead } from "@/lib/types";

const MAX_REASON_POINTS = 25;
const COPIED_RESET_MS = 1500;
const LINK_CLASS = "text-slate-700 hover:text-emerald-700 hover:underline";

function DetailPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-4">
      <h3 className="eyebrow mb-3">{title}</h3>
      {children}
    </section>
  );
}

function LeadFacts({ lead }: { lead: Lead }) {
  const facts = [
    lead.foundedYear && `Founded ${lead.foundedYear}`,
    lead.domainRegisteredYear && `Domain since ${lead.domainRegisteredYear}`,
    lead.platform && `Built on ${lead.platform}`,
    lead.cached && "From cache",
  ].filter((fact): fact is string => Boolean(fact));

  if (!lead.description && facts.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {lead.description && <p className="mr-2 max-w-3xl text-slate-600">{lead.description}</p>}
      {facts.map((fact) => (
        <span key={fact} className="rounded-md bg-white px-2 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200">
          {fact}
        </span>
      ))}
    </div>
  );
}

function ScoreBreakdown({ reasons }: { reasons: Lead["reasons"] }) {
  return (
    <ul className="space-y-3">
      {reasons.map((reason) => (
        <li key={reason.label}>
          <div className="flex items-start justify-between gap-3 text-sm">
            <span className="text-slate-700">{reason.label}</span>
            <span className="font-mono text-xs font-semibold text-emerald-600">+{reason.points}</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-400 to-teal-500"
              style={{ width: `${(reason.points / MAX_REASON_POINTS) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ContactList({ lead }: { lead: Lead }) {
  const socials = Object.entries(lead.socials);

  return (
    <>
      <ul className="space-y-2 text-sm">
        {lead.emails.map((email, index) => (
          <li key={email} className="flex items-center gap-2">
            {index === 0 && lead.emailDeliverable ? (
              <MailCheck className="size-4 shrink-0 text-emerald-500" />
            ) : (
              <Mail className="size-4 shrink-0 text-slate-400" />
            )}
            <a href={`mailto:${email}`} className={`truncate ${LINK_CLASS}`}>
              {email}
            </a>
          </li>
        ))}
        {lead.phones.map((phone) => (
          <li key={phone} className="flex items-center gap-2">
            <Phone className="size-4 shrink-0 text-slate-400" />
            <a href={`tel:${phone.replaceAll(" ", "")}`} className={LINK_CLASS}>
              {phone}
            </a>
          </li>
        ))}
        {lead.url && (
          <li className="flex items-center gap-2">
            <Globe className="size-4 shrink-0 text-slate-400" />
            <a href={lead.url} target="_blank" rel="noreferrer" className={`truncate ${LINK_CLASS}`}>
              {lead.url.replace(/^https?:\/\//, "")}
            </a>
          </li>
        )}
      </ul>

      {socials.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {socials.map(([network, url]) => (
            <a
              key={network}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 px-2 py-0.5 text-xs font-medium capitalize text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {network}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function OutreachOpener({ lead }: { lead: Lead }) {
  const [copied, setCopied] = useState(false);
  const [primaryEmail] = lead.emails;

  if (!lead.opener) return <p className="text-sm text-slate-500">Not available for this lead.</p>;

  const opener = lead.opener;
  const subject = `Quick question about ${lead.name ?? lead.domain}`;
  const draftUrl = `mailto:${primaryEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(opener)}`;

  async function copyOpener() {
    await navigator.clipboard.writeText(opener);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_RESET_MS);
  }

  return (
    <>
      <blockquote className="rounded-lg border-l-2 border-emerald-400 bg-emerald-50/50 px-3 py-2.5 text-sm leading-relaxed text-slate-700">
        {opener}
      </blockquote>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={copyOpener} className="btn-secondary">
          {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
        {primaryEmail && (
          <a href={draftUrl} className="btn-secondary">
            <Send className="size-4" />
            Open email draft
          </a>
        )}
      </div>
    </>
  );
}

export function LeadDetails({ lead }: { lead: Lead }) {
  return (
    <div className="fade-up space-y-4 bg-slate-50/80 px-5 py-5">
      <LeadFacts lead={lead} />
      <div className="grid gap-4 md:grid-cols-3">
        <DetailPanel title="Why this score">
          <ScoreBreakdown reasons={lead.reasons} />
        </DetailPanel>
        <DetailPanel title="Contact & presence">
          <ContactList lead={lead} />
        </DetailPanel>
        <DetailPanel title="Outreach opener">
          <OutreachOpener lead={lead} />
        </DetailPanel>
      </div>
    </div>
  );
}
