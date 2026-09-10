import { AppointmentInput } from "@/types/appointment";

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function getDefaultStartTime(): string {
  const now = new Date();
  const minutes = now.getMinutes();
  const rounded = Math.ceil((minutes + 1) / 30) * 30;
  const start = new Date(now);
  start.setMinutes(rounded % 60, 0, 0);
  if (rounded >= 60) start.setHours(start.getHours() + 1);
  return formatTime(start.getHours(), start.getMinutes());
}

export function getDefaultEndTime(startTime?: string): string {
  if (startTime) {
    const [h, m] = startTime.split(":").map(Number);
    const end = new Date();
    end.setHours(h, m + 30, 0, 0);
    return formatTime(end.getHours(), end.getMinutes());
  }
  const start = getDefaultStartTime();
  const [h, m] = start.split(":").map(Number);
  const end = new Date();
  end.setHours(h, m + 30, 0, 0);
  return formatTime(end.getHours(), end.getMinutes());
}

export function getDefaultAppointmentInput(): AppointmentInput {
  const startTime = getDefaultStartTime();
  return {
    title: "",
    description: "",
    date: getTodayDateString(),
    startTime,
    endTime: getDefaultEndTime(startTime),
  };
}
