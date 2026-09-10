"use client";

import { useEffect, useRef, useState } from "react";
import { Appointment, AppointmentInput } from "@/types/appointment";
import {
  findConflict,
  formatConflictMessage,
  parseServerConflictError,
  validateAppointmentInput,
} from "@/lib/appointment-utils";
import { getDefaultAppointmentInput, getDefaultEndTime } from "@/lib/form-defaults";

interface AppointmentModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialData?: Appointment | null;
  allAppointments: Appointment[];
  onClose: () => void;
  onSubmit: (input: AppointmentInput) => Promise<void>;
  loading?: boolean;
}

export function AppointmentModal({
  open,
  mode,
  initialData,
  allAppointments,
  onClose,
  onSubmit,
  loading = false,
}: AppointmentModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<AppointmentInput>(getDefaultAppointmentInput());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictInfo, setConflictInfo] = useState<{
    title: string;
    detail: string;
    hint: string;
  } | null>(null);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialData) {
      setForm({
        title: initialData.title,
        description: initialData.description,
        date: initialData.date,
        startTime: initialData.startTime,
        endTime: initialData.endTime,
      });
    } else {
      setForm(getDefaultAppointmentInput());
    }
    setErrors({});
    setConflictInfo(null);

    const timer = window.setTimeout(() => titleRef.current?.focus(), 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, mode, initialData, onClose, loading]);

  const checkConflict = (input: AppointmentInput) => {
    if (!input.date || !input.startTime || !input.endTime) {
      setConflictInfo(null);
      return;
    }
    const validation = validateAppointmentInput(input);
    if (!validation.valid) {
      setConflictInfo(null);
      return;
    }
    const conflict = findConflict(
      input,
      allAppointments,
      mode === "edit" && initialData ? initialData.id : undefined
    );
    setConflictInfo(conflict ? formatConflictMessage(conflict) : null);
  };

  if (!open) return null;

  const handleChange = (field: keyof AppointmentInput, value: string) => {
    const next = { ...form, [field]: value };
    if (field === "startTime" && value && !form.endTime) {
      next.endTime = getDefaultEndTime(value);
    }
    setForm(next);
    if (errors[field] || errors.form) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        delete updated.form;
        return updated;
      });
    }
    if (field === "date" || field === "startTime" || field === "endTime") {
      checkConflict(next);
    }
  };

  const handleBlurValidate = (field: keyof AppointmentInput) => {
    const validation = validateAppointmentInput(form);
    if (validation.errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validation.errors[field] }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validation = validateAppointmentInput(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const conflict = findConflict(
      form,
      allAppointments,
      mode === "edit" && initialData ? initialData.id : undefined
    );
    if (conflict) {
      setConflictInfo(formatConflictMessage(conflict));
      return;
    }

    try {
      await onSubmit(form);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      const parsed = parseServerConflictError(message);
      if (parsed) {
        setConflictInfo(parsed);
      } else {
        setErrors({ form: message });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={() => !loading && onClose()}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-modal-title"
        className="animate-scale-in relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-600">
              {mode === "create" ? "New" : "Update"}
            </p>
            <h2 id="appointment-modal-title" className="mt-0.5 text-lg font-semibold text-slate-900">
              {mode === "create" ? "Add Appointment" : "Edit Appointment"}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {mode === "create"
                ? "Fill in the details to schedule a team appointment."
                : "Update the appointment details below."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            aria-label="Close dialog"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6" noValidate>
          {errors.form && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              <AlertIcon />
              <span>{errors.form}</span>
            </div>
          )}

          {conflictInfo && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
              <p className="font-semibold">{conflictInfo.title}</p>
              <p className="mt-0.5">{conflictInfo.detail}</p>
              <p className="mt-1 text-amber-800">{conflictInfo.hint}</p>
            </div>
          )}

          <Field label="Title" error={errors.title} required>
            <input
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              onBlur={() => handleBlurValidate("title")}
              className={inputClass(errors.title)}
              placeholder="Client Kickoff Meeting"
              autoComplete="off"
            />
          </Field>

          <Field label="Description" error={errors.description} required>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              onBlur={() => handleBlurValidate("description")}
              rows={2}
              className={inputClass(errors.description)}
              placeholder="Brief context for the team…"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Date" error={errors.date} required>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                onBlur={() => handleBlurValidate("date")}
                className={inputClass(errors.date)}
              />
            </Field>

            <Field label="Start" error={errors.startTime} required>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                onBlur={() => handleBlurValidate("startTime")}
                className={inputClass(errors.startTime)}
              />
            </Field>

            <Field label="End" error={errors.endTime} required>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                onBlur={() => handleBlurValidate("endTime")}
                className={inputClass(errors.endTime)}
              />
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Boolean(conflictInfo)}
              className="h-10 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving…
                </span>
              ) : mode === "create" ? (
                "Create Appointment"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function inputClass(error?: string): string {
  return `h-10 w-full rounded-lg border bg-slate-50/50 px-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 ${
    error
      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
      : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
  }`;
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
