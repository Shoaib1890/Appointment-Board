"use client";

import { Appointment } from "@/types/appointment";
import { formatCompactDate, formatTimeRange } from "@/lib/appointment-utils";
import { StatusBadge } from "@/components/StatusBadge";

interface AppointmentCardProps {
  appointment: Appointment;
  onView: (appointment: Appointment) => void;
  onEdit: (appointment: Appointment) => void;
  onComplete: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  actionLoading?: string | null;
  isTransitioning?: boolean;
}

export function AppointmentCard({
  appointment,
  onView,
  onEdit,
  onComplete,
  onCancel,
  actionLoading,
  isTransitioning = false,
}: AppointmentCardProps) {
  const { status } = appointment;
  const isCancelled = status === "cancelled";
  const isCompleted = status === "completed";
  const isScheduled = status === "scheduled";
  const isBusy = actionLoading === appointment.id;

  const cardStyles = {
    scheduled:
      "border-slate-200/90 bg-white hover:border-indigo-200 hover:bg-indigo-50/20 hover:shadow-md hover:shadow-indigo-500/5",
    completed:
      "border-emerald-200/70 bg-white hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/5",
    cancelled:
      "border-slate-200/60 bg-slate-50/80 hover:border-slate-300 hover:shadow-sm",
  };

  return (
    <article
      className={`group flex h-full flex-col rounded-xl border shadow-sm transition-all duration-200 ${cardStyles[status]} ${
        isTransitioning ? "status-transition ring-2 ring-indigo-200/60" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onView(appointment)}
        className="flex flex-1 flex-col p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-300 rounded-t-xl"
        aria-label={`View details for ${appointment.title}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3
              className={`truncate text-[15px] font-semibold leading-snug ${
                isCancelled ? "text-slate-500 line-through decoration-slate-400" : "text-slate-900"
              }`}
            >
              {appointment.title}
            </h3>
          </div>
          <StatusBadge status={status} />
        </div>

        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-500">
          {appointment.description}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 ring-1 ring-slate-100 transition group-hover:bg-white">
            <CalendarIcon className="shrink-0 text-slate-400" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Date</p>
              <p className="truncate text-[13px] font-medium text-slate-700">
                {formatCompactDate(appointment.date)}
              </p>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 ring-1 ring-slate-100 transition group-hover:bg-white">
            <ClockIcon className="shrink-0 text-slate-400" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Time</p>
              <p className="truncate text-[13px] font-medium tabular-nums text-slate-700">
                {formatTimeRange(appointment.startTime, appointment.endTime)}
              </p>
            </div>
          </div>
        </div>

        {isCancelled && (
          <p className="mt-2.5 rounded-md bg-rose-50 px-2.5 py-1.5 text-[11px] font-medium text-rose-600 ring-1 ring-rose-100">
            Slot available — no longer blocks scheduling
          </p>
        )}
        {isCompleted && (
          <p className="mt-2.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-600 ring-1 ring-emerald-100">
            Time slot remains reserved
          </p>
        )}
      </button>

      {isScheduled && (
        <div className="flex items-center gap-1.5 border-t border-slate-100 px-3 py-2.5 opacity-90 transition duration-150 group-hover:opacity-100">
          <ActionButton
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(appointment);
            }}
            disabled={isBusy}
            label="Edit appointment"
          >
            <EditIcon />
            Edit
          </ActionButton>
          <ActionButton
            variant="success"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(appointment);
            }}
            disabled={isBusy}
            label="Mark appointment complete"
          >
            <CheckIcon />
            {isBusy ? "Saving…" : "Complete"}
          </ActionButton>
          <ActionButton
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onCancel(appointment);
            }}
            disabled={isBusy}
            label="Cancel appointment"
          >
            <XIcon />
            Cancel
          </ActionButton>
        </div>
      )}
    </article>
  );
}

function ActionButton({
  children,
  onClick,
  variant,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  variant: "ghost" | "success" | "danger";
  disabled?: boolean;
  label: string;
}) {
  const styles = {
    ghost:
      "flex-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 ring-1 ring-transparent hover:ring-slate-200",
    success:
      "flex-1 text-emerald-700 hover:bg-emerald-50 ring-1 ring-emerald-200/60 hover:ring-emerald-300",
    danger:
      "flex-1 text-rose-600 hover:bg-rose-50 ring-1 ring-rose-200/60 hover:ring-rose-300",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[12px] font-medium transition duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`h-3.5 w-3.5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`h-3.5 w-3.5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
