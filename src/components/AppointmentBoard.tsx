"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createAppointmentApi,
  fetchAppointments,
  updateAppointmentApi,
  updateAppointmentStatusApi,
} from "@/lib/api-client";
import {
  cancelledToast,
  completedToast,
  createdToast,
  updatedToast,
} from "@/lib/toast-messages";
import {
  Appointment,
  AppointmentFilters,
  AppointmentInput,
  AppointmentStatus,
} from "@/types/appointment";
import { AppointmentCard } from "@/components/AppointmentCard";
import { AppointmentDetailModal } from "@/components/AppointmentDetailModal";
import { AppointmentFiltersBar, hasActiveFilters } from "@/components/AppointmentFiltersBar";
import { AppointmentModal } from "@/components/AppointmentModal";
import {
  AppointmentGridSkeleton,
  StatsSkeleton,
} from "@/components/AppointmentSkeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { SectionHeader } from "@/components/SectionHeader";
import { StatsCards } from "@/components/StatsCards";
import { Toast } from "@/components/Toast";

type ToastState = { title: string; message?: string; type: "success" | "error" } | null;
type StatFilter = "all" | AppointmentStatus;

function applyStatusFilter(
  filters: AppointmentFilters,
  statFilter: StatFilter
): AppointmentFilters {
  return {
    ...filters,
    status: statFilter === "all" ? "all" : statFilter,
  };
}

function getActiveStatFilter(filters: AppointmentFilters): StatFilter {
  if (!filters.status || filters.status === "all") return "all";
  return filters.status;
}

export function AppointmentBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [filters, setFilters] = useState<AppointmentFilters>({ status: "all" });
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [transitioningId, setTransitioningId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Appointment | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const isFirstLoad = useRef(true);

  const showToast = useCallback((title: string, type: "success" | "error", message?: string) => {
    setToast({ title, message, type });
    window.setTimeout(() => setToast(null), 4500);
  }, []);

  const loadAppointments = useCallback(async () => {
    if (isFirstLoad.current) {
      setInitialLoading(true);
    } else {
      setRefreshing(true);
    }
    setLoadError(null);
    try {
      const [filtered, all] = await Promise.all([
        fetchAppointments(filters),
        fetchAppointments(),
      ]);
      setAppointments(filtered);
      setAllAppointments(all);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load appointments.";
      setLoadError(message);
      showToast("Could not load appointments", "error", message);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
      isFirstLoad.current = false;
    }
  }, [filters, showToast]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const syncAfterMutation = useCallback(async () => {
    try {
      const [filtered, all] = await Promise.all([
        fetchAppointments(filters),
        fetchAppointments(),
      ]);
      setAppointments(filtered);
      setAllAppointments(all);
      if (detailAppointment) {
        const updated = all.find((a) => a.id === detailAppointment.id);
        setDetailAppointment(updated ?? null);
      }
    } catch {
      await loadAppointments();
    }
  }, [filters, detailAppointment, loadAppointments]);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedAppointment(null);
    setModalOpen(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setDetailAppointment(null);
    setModalMode("edit");
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const openDetailModal = (appointment: Appointment) => {
    setDetailAppointment(appointment);
  };

  const handleModalSubmit = async (input: AppointmentInput) => {
    setSubmitLoading(true);
    try {
      if (modalMode === "create") {
        const result = await createAppointmentApi(input);
        const t = createdToast(result.appointment);
        showToast(t.title, "success", t.message);
      } else if (selectedAppointment) {
        const result = await updateAppointmentApi(selectedAppointment.id, input);
        const t = updatedToast(result.appointment);
        showToast(t.title, "success", t.message);
      }
      setModalOpen(false);
      await syncAfterMutation();
    } finally {
      setSubmitLoading(false);
    }
  };

  const updateLocalStatus = (id: string, status: AppointmentStatus) => {
    const updater = (list: Appointment[]) =>
      list.map((a) => (a.id === id ? { ...a, status } : a));
    setAppointments(updater);
    setAllAppointments(updater);
    setDetailAppointment((prev) => (prev?.id === id ? { ...prev, status } : prev));
  };

  const handleComplete = async (appointment: Appointment) => {
    setActionLoading(appointment.id);
    setTransitioningId(appointment.id);
    updateLocalStatus(appointment.id, "completed");
    setDetailAppointment(null);
    try {
      const result = await updateAppointmentStatusApi(appointment.id, "completed");
      const t = completedToast(result.appointment);
      showToast(t.title, "success", t.message);
      await syncAfterMutation();
    } catch (error) {
      await syncAfterMutation();
      showToast(
        "Could not complete appointment",
        "error",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setActionLoading(null);
      window.setTimeout(() => setTransitioningId(null), 400);
    }
  };

  const handleCancelConfirm = async () => {
    if (!confirmCancel) return;
    const target = confirmCancel;
    setActionLoading(target.id);
    setTransitioningId(target.id);
    updateLocalStatus(target.id, "cancelled");
    setDetailAppointment(null);
    try {
      const result = await updateAppointmentStatusApi(target.id, "cancelled");
      const t = cancelledToast(result.appointment);
      showToast(t.title, "success", t.message);
      setConfirmCancel(null);
      await syncAfterMutation();
    } catch (error) {
      await syncAfterMutation();
      showToast(
        "Could not cancel appointment",
        "error",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setActionLoading(null);
      window.setTimeout(() => setTransitioningId(null), 400);
    }
  };

  const handleStatFilterClick = (statFilter: StatFilter) => {
    setFilters((prev) => applyStatusFilter(prev, statFilter));
  };

  const activeFilters = hasActiveFilters(filters);

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
                Team Scheduling
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
                Appointment Board
              </h1>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                Manage team appointments, track status, and prevent scheduling conflicts.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-300 active:scale-[0.98]"
            >
              <PlusIcon />
              Add Appointment
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-5 sm:px-6 sm:py-6">
        <section>
          <SectionHeader
            title="Overview"
            description="Quick summary of your team's schedule. Click a metric to filter."
          />
          {initialLoading ? (
            <StatsSkeleton />
          ) : (
            !loadError && (
              <StatsCards
                appointments={allAppointments}
                activeStatusFilter={getActiveStatFilter(filters)}
                onFilterClick={handleStatFilterClick}
              />
            )
          )}
        </section>

        <section>
          <SectionHeader
            title="Appointments"
            description={
              activeFilters
                ? `Showing ${appointments.length} of ${allAppointments.length} appointments`
                : `${allAppointments.length} appointment${allAppointments.length === 1 ? "" : "s"} on the board`
            }
          />

          <AppointmentFiltersBar filters={filters} onChange={setFilters} />

          <div className="mt-4">
            {initialLoading ? (
              <AppointmentGridSkeleton />
            ) : loadError ? (
              <ErrorState message={loadError} onRetry={loadAppointments} />
            ) : appointments.length === 0 ? (
              <EmptyState
                hasFilters={activeFilters}
                onAdd={openCreateModal}
                onClearFilters={() => setFilters({ date: undefined, status: "all" })}
              />
            ) : (
              <div
                className={`grid grid-cols-1 gap-3 transition-opacity duration-150 lg:grid-cols-2 ${
                  refreshing ? "opacity-70" : "opacity-100"
                }`}
              >
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onView={openDetailModal}
                    onEdit={openEditModal}
                    onComplete={handleComplete}
                    onCancel={setConfirmCancel}
                    actionLoading={actionLoading}
                    isTransitioning={transitioningId === appointment.id}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <HowItWorksSection />
      </main>

      <AppointmentModal
        open={modalOpen}
        mode={modalMode}
        initialData={selectedAppointment}
        allAppointments={allAppointments}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        loading={submitLoading}
      />

      <AppointmentDetailModal
        appointment={detailAppointment}
        onClose={() => setDetailAppointment(null)}
        onEdit={openEditModal}
        onComplete={handleComplete}
        onCancel={setConfirmCancel}
        actionLoading={actionLoading}
      />

      <ConfirmDialog
        open={Boolean(confirmCancel)}
        title="Cancel appointment?"
        message={
          confirmCancel
            ? `"${confirmCancel.title}" will be marked as cancelled. The appointment stays visible but the time slot becomes available.`
            : ""
        }
        confirmLabel="Cancel Appointment"
        onConfirm={handleCancelConfirm}
        onCancel={() => setConfirmCancel(null)}
        loading={Boolean(confirmCancel && actionLoading === confirmCancel.id)}
      />

      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-rose-200 bg-white px-6 py-10 text-center shadow-sm">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <AlertIcon />
      </div>
      <h3 className="mt-3 text-base font-semibold text-slate-900">Could not load appointments</h3>
      <p className="mt-1.5 text-sm text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 h-9 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onAdd,
  onClearFilters,
}: {
  hasFilters: boolean;
  onAdd: () => void;
  onClearFilters: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <CalendarIcon />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        {hasFilters ? "No appointments found" : "Your schedule is clear"}
      </h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
        {hasFilters
          ? "Try adjusting your filters or create a new appointment."
          : "Create your first appointment to get started."}
      </p>
      <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="h-9 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            Clear filters
          </button>
        )}
        <button
          type="button"
          onClick={onAdd}
          className="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          Add appointment
        </button>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
    </svg>
  );
}
