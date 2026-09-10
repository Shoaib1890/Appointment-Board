"use client";

import { AppointmentStatus } from "@/types/appointment";

const statusConfig: Record<
  AppointmentStatus,
  { label: string; dot: string; badge: string }
> = {
  scheduled: {
    label: "Scheduled",
    dot: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-600/15",
  },
  completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-rose-400",
    badge: "bg-rose-50 text-rose-700 ring-rose-600/15",
  },
};

interface StatusBadgeProps {
  status: AppointmentStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass =
    size === "sm"
      ? "px-2 py-0.5 text-[11px]"
      : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset ${config.badge} ${sizeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
