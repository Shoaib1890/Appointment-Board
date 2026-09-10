"use client";

import { AppointmentStatus } from "@/types/appointment";

type StatFilter = "all" | AppointmentStatus;

interface StatsCardsProps {
  appointments: { status: AppointmentStatus }[];
  activeStatusFilter: StatFilter;
  onFilterClick: (filter: StatFilter) => void;
}

export function StatsCards({
  appointments,
  activeStatusFilter,
  onFilterClick,
}: StatsCardsProps) {
  const total = appointments.length;
  const scheduled = appointments.filter((a) => a.status === "scheduled").length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;

  const stats: {
    key: StatFilter;
    label: string;
    value: number;
    icon: React.ReactNode;
    accent: string;
    bg: string;
    activeRing: string;
  }[] = [
    {
      key: "all",
      label: "Total",
      value: total,
      icon: <GridIcon />,
      accent: "text-slate-700",
      bg: "bg-slate-50",
      activeRing: "ring-slate-400 border-slate-300",
    },
    {
      key: "scheduled",
      label: "Scheduled",
      value: scheduled,
      icon: <CalendarIcon />,
      accent: "text-indigo-700",
      bg: "bg-indigo-50",
      activeRing: "ring-indigo-400 border-indigo-300",
    },
    {
      key: "completed",
      label: "Completed",
      value: completed,
      icon: <CheckIcon />,
      accent: "text-emerald-700",
      bg: "bg-emerald-50",
      activeRing: "ring-emerald-400 border-emerald-300",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value: cancelled,
      icon: <XIcon />,
      accent: "text-rose-700",
      bg: "bg-rose-50",
      activeRing: "ring-rose-400 border-rose-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const isActive = activeStatusFilter === stat.key;
        return (
          <button
            key={stat.key}
            type="button"
            onClick={() => onFilterClick(stat.key)}
            aria-pressed={isActive}
            aria-label={`Filter by ${stat.label.toLowerCase()}: ${stat.value} appointments`}
            className={`flex items-center gap-3 rounded-xl border bg-white p-3.5 text-left shadow-sm transition duration-150 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
              isActive
                ? `${stat.activeRing} ring-2 shadow-md`
                : "border-slate-200/80 ring-1 ring-inset ring-slate-200/80 hover:border-slate-300"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.bg} ${stat.accent}`}
            >
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                {stat.label}
              </p>
              <p className="text-xl font-semibold tabular-nums text-slate-900">{stat.value}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function GridIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
