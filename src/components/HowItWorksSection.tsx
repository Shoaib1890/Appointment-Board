"use client";

import { useState } from "react";

export function HowItWorksSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-slate-50/80"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <InfoIcon />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">How it works & assumptions</p>
            <p className="text-xs text-slate-500">Scheduling rules and implementation notes</p>
          </div>
        </div>
        <ChevronIcon expanded={expanded} />
      </button>

      {expanded && (
        <div className="animate-fade-in border-t border-slate-100 px-4 pb-4 pt-3">
          <div className="grid gap-4 text-[13px] leading-relaxed text-slate-600 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Scheduling rules
              </h3>
              <ul className="mt-2 space-y-1.5">
                <li>· Time ranges use half-open intervals [start, end)</li>
                <li>· Adjacent slots are allowed (10–11 & 11–12)</li>
                <li>· Only non-cancelled appointments block conflicts</li>
                <li>· Completed appointments keep their slot reserved</li>
                <li>· Cancelled appointments free their slot for reuse</li>
              </ul>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Implementation
              </h3>
              <ul className="mt-2 space-y-1.5">
                <li>· Next.js, TypeScript, Tailwind CSS, REST API</li>
                <li>· Data persists in a local JSON file</li>
                <li>· Validation on client and server</li>
                <li>· Single shared team board (no auth)</li>
                <li>· Sample data seeded on first run</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function InfoIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
