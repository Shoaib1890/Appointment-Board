import { Appointment, AppointmentInput } from "@/types/appointment";

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function validateAppointmentInput(input: AppointmentInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.title?.trim()) {
    errors.title = "Title is required.";
  }

  if (!input.description?.trim()) {
    errors.description = "Description is required.";
  }

  if (!input.date?.trim()) {
    errors.date = "Date is required.";
  } else if (!DATE_REGEX.test(input.date)) {
    errors.date = "Date must be in YYYY-MM-DD format.";
  }

  if (!input.startTime?.trim()) {
    errors.startTime = "Start time is required.";
  } else if (!TIME_REGEX.test(input.startTime)) {
    errors.startTime = "Start time must be in HH:MM format.";
  }

  if (!input.endTime?.trim()) {
    errors.endTime = "End time is required.";
  } else if (!TIME_REGEX.test(input.endTime)) {
    errors.endTime = "End time must be in HH:MM format.";
  }

  if (
    !errors.startTime &&
    !errors.endTime &&
    timeToMinutes(input.endTime) <= timeToMinutes(input.startTime)
  ) {
    errors.endTime = "End time must be after start time.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Two ranges [start, end) overlap when startA < endB && startB < endA.
 */
export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);
  return aStart < bEnd && bStart < aEnd;
}

export function findConflict(
  input: AppointmentInput,
  appointments: Appointment[],
  excludeId?: string
): Appointment | null {
  return (
    appointments.find((appointment) => {
      if (excludeId && appointment.id === excludeId) return false;
      if (appointment.status === "cancelled") return false;
      if (appointment.date !== input.date) return false;
      return rangesOverlap(
        input.startTime,
        input.endTime,
        appointment.startTime,
        appointment.endTime
      );
    }) ?? null
  );
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`;
}

export function formatCompactDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDisplayDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getStatusLabel(status: Appointment["status"]): string {
  switch (status) {
    case "scheduled":
      return "Scheduled";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
  }
}

export function formatConflictMessage(conflict: Appointment): {
  title: string;
  detail: string;
  hint: string;
} {
  return {
    title: "Time slot unavailable",
    detail: `"${conflict.title}" is scheduled from ${formatTimeRange(conflict.startTime, conflict.endTime)}.`,
    hint: "Choose another time to continue.",
  };
}

export function parseServerConflictError(error: string): {
  title: string;
  detail: string;
  hint: string;
} | null {
  const match = error.match(
    /Time slot conflicts with "(.+)" \((\d{2}:\d{2})[–-](\d{2}:\d{2})\)/
  );
  if (!match) return null;
  return {
    title: "Time slot unavailable",
    detail: `"${match[1]}" is scheduled from ${match[2]} – ${match[3]}.`,
    hint: "Choose another time to continue.",
  };
}
