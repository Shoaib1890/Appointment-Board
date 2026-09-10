"use client";

import { useEffect, useRef } from "react";
import { Appointment } from "@/types/appointment";
import {
  formatCompactDate,
  formatTimeRange,
} from "@/lib/appointment-utils";
import { StatusBadge } from "@/components/StatusBadge";

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  onEdit: (appointment: Appointment) => void;
  onComplete: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  actionLoading?: string | null;
}

export function AppointmentDetailModal({
  appointment,
  onClose,
  onEdit,
  onComplete,
  onCancel,
  actionLoading,
}: AppointmentDetailModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!appointment) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [appointment, onClose]);

  if (!appointment) return null;

  const isScheduled = appointment.status === "scheduled";
  const isCompleted = appointment.status === "completed";
  const isCancelled = appointment.status === "cancelled";
  const isBusy = actionLoading === appointment.id;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
        className="animate-scale-in relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0 pr-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-600">
              Appointment Details
            </p>
            <h2
              id="detail-modal-title"
              className={`mt-0.5 text-lg font-semibold ${
                isCancelled ? "text-slate-500 line-through" : "text-slate-900"
              }`}
            >
              {appointment.title}
            </h2>
            <div className="mt-2">
              <StatusBadge status={appointment.status} size="md" />
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            aria-label="Close details"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <DetailBlock label="Description">{appointment.description}</DetailBlock>

          <div className="grid grid-cols-2 gap-3">
            <DetailBlock label="Date">{formatCompactDate(appointment.date)}</DetailBlock>
            <DetailBlock label="Time">
              {formatTimeRange(appointment.startTime, appointment.endTime)}
            </DetailBlock>
          </div>

          {isCompleted && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-100">
              This appointment is completed and its time slot remains reserved.
            </p>
          )}
          {isCancelled && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">
              This appointment was cancelled and no longer blocks the time slot.
            </p>
          )}

          {isScheduled && (
            <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
              <button
                type="button"
                onClick={() => onEdit(appointment)}
                disabled={isBusy}
                className="h-10 flex-1 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onComplete(appointment)}
                disabled={isBusy}
                className="h-10 flex-1 rounded-lg bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-50"
              >
                {isBusy ? "Saving…" : "Mark Complete"}
              </button>
              <button
                type="button"
                onClick={() => onCancel(appointment)}
                disabled={isBusy}
                className="h-10 flex-1 rounded-lg border border-rose-200 bg-rose-50 text-sm font-medium text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{children}</p>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
