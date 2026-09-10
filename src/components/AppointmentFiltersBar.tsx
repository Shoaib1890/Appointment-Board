"use client";

import { AppointmentFilters, AppointmentStatus } from "@/types/appointment";

interface AppointmentFiltersBarProps {
  filters: AppointmentFilters;
  onChange: (filters: AppointmentFilters) => void;
}

const statusOptions: { value: AppointmentStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function hasActiveFilters(filters: AppointmentFilters): boolean {
  return Boolean(filters.date || (filters.status && filters.status !== "all"));
}

function formatFilterDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function AppointmentFiltersBar({
  filters,
  onChange,
}: AppointmentFiltersBarProps) {
  const active = hasActiveFilters(filters);

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-xl lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-date" className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Date
          </label>
          <input
            id="filter-date"
            type="date"
            value={filters.date || ""}
            onChange={(e) =>
              onChange({ ...filters, date: e.target.value || undefined })
            }
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-status" className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Status
          </label>
          <select
            id="filter-status"
            value={filters.status || "all"}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as AppointmentStatus | "all",
              })
            }
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {active && (
          <button
            type="button"
            onClick={() => onChange({ date: undefined, status: "all" })}
            className="h-9 shrink-0 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:col-span-2 lg:col-span-1"
          >
            Clear filters
          </button>
        )}
      </div>

      {active && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Active filters
          </span>
          {filters.date && (
            <FilterChip
              label={`Date: ${formatFilterDate(filters.date)}`}
              onRemove={() => onChange({ ...filters, date: undefined })}
            />
          )}
          {filters.status && filters.status !== "all" && (
            <FilterChip
              label={`Status: ${statusLabels[filters.status]}`}
              onRemove={() => onChange({ ...filters, status: "all" })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 py-1 pl-2.5 pr-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 text-indigo-500 transition hover:bg-indigo-100 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        aria-label={`Remove ${label} filter`}
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
