import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  findConflict,
  validateAppointmentInput,
} from "@/lib/appointment-utils";
import {
  Appointment,
  AppointmentFilters,
  AppointmentInput,
  AppointmentStatus,
} from "@/types/appointment";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "appointments.json");

function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDayAfterTomorrowDate(): string {
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const year = dayAfter.getFullYear();
  const month = String(dayAfter.getMonth() + 1).padStart(2, "0");
  const day = String(dayAfter.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createSeedAppointments(): Appointment[] {
  const now = new Date().toISOString();
  const today = getTodayDate();
  const tomorrow = getTomorrowDate();
  const dayAfter = getDayAfterTomorrowDate();

  return [
    {
      id: uuidv4(),
      title: "Team Standup",
      description: "Daily sync with engineering and product teams.",
      date: today,
      startTime: "09:00",
      endTime: "09:30",
      status: "completed",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: "Client Discovery Call",
      description: "Initial requirements gathering with Acme Corp stakeholders.",
      date: today,
      startTime: "11:00",
      endTime: "12:00",
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: "Design Review",
      description: "Review dashboard wireframes and feedback from stakeholders.",
      date: today,
      startTime: "14:00",
      endTime: "15:00",
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: "Lunch with Vendor",
      description: "Rescheduled due to vendor availability — slot freed up.",
      date: today,
      startTime: "12:00",
      endTime: "13:00",
      status: "cancelled",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: "Board Strategy Meeting",
      description: "Quarterly review of product roadmap and team priorities.",
      date: tomorrow,
      startTime: "09:00",
      endTime: "10:00",
      status: "completed",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: "Sprint Planning",
      description: "Plan upcoming sprint goals, capacity, and backlog priorities.",
      date: tomorrow,
      startTime: "10:00",
      endTime: "11:30",
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: "1:1 with Manager",
      description: "Weekly check-in on progress, blockers, and career goals.",
      date: tomorrow,
      startTime: "15:00",
      endTime: "15:30",
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: "Product Demo",
      description: "Walkthrough of new appointment board features for stakeholders.",
      date: dayAfter,
      startTime: "13:00",
      endTime: "14:00",
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: "Training Session",
      description: "Onboarding session for new team members on internal tools.",
      date: dayAfter,
      startTime: "16:00",
      endTime: "17:00",
      status: "cancelled",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    const seed = createSeedAppointments();
    await fs.writeFile(DATA_FILE, JSON.stringify(seed, null, 2), "utf-8");
  }
}

async function readAppointments(): Promise<Appointment[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  const parsed = JSON.parse(raw) as Appointment[];
  return parsed.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
}

async function writeAppointments(appointments: Appointment[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(appointments, null, 2), "utf-8");
}

export async function getAllAppointments(
  filters: AppointmentFilters = {}
): Promise<Appointment[]> {
  const appointments = await readAppointments();

  return appointments.filter((appointment) => {
    if (filters.date && appointment.date !== filters.date) return false;
    if (filters.status && filters.status !== "all" && appointment.status !== filters.status) {
      return false;
    }
    return true;
  });
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const appointments = await readAppointments();
  return appointments.find((appointment) => appointment.id === id) ?? null;
}

export async function createAppointment(
  input: AppointmentInput
): Promise<{ appointment?: Appointment; error?: string; fieldErrors?: Record<string, string> }> {
  const validation = validateAppointmentInput(input);
  if (!validation.valid) {
    return { fieldErrors: validation.errors };
  }

  const appointments = await readAppointments();
  const conflict = findConflict(input, appointments);

  if (conflict) {
    return {
      error: `Time slot conflicts with "${conflict.title}" (${conflict.startTime}–${conflict.endTime}).`,
    };
  }

  const now = new Date().toISOString();
  const appointment: Appointment = {
    id: uuidv4(),
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
    status: "scheduled",
    createdAt: now,
    updatedAt: now,
  };

  appointments.push(appointment);
  await writeAppointments(appointments);

  return { appointment };
}

export async function updateAppointment(
  id: string,
  input: AppointmentInput
): Promise<{ appointment?: Appointment; error?: string; fieldErrors?: Record<string, string> }> {
  const validation = validateAppointmentInput(input);
  if (!validation.valid) {
    return { fieldErrors: validation.errors };
  }

  const appointments = await readAppointments();
  const index = appointments.findIndex((appointment) => appointment.id === id);

  if (index === -1) {
    return { error: "Appointment not found." };
  }

  const existing = appointments[index];

  if (existing.status === "cancelled") {
    return { error: "Cancelled appointments cannot be edited." };
  }

  const conflict = findConflict(input, appointments, id);

  if (conflict) {
    return {
      error: `Time slot conflicts with "${conflict.title}" (${conflict.startTime}–${conflict.endTime}).`,
    };
  }

  const updated: Appointment = {
    ...existing,
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
    updatedAt: new Date().toISOString(),
  };

  appointments[index] = updated;
  await writeAppointments(appointments);

  return { appointment: updated };
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<{ appointment?: Appointment; error?: string }> {
  const appointments = await readAppointments();
  const index = appointments.findIndex((appointment) => appointment.id === id);

  if (index === -1) {
    return { error: "Appointment not found." };
  }

  const existing = appointments[index];

  if (existing.status === "cancelled") {
    return { error: "This appointment is already cancelled." };
  }

  if (status === "completed" && existing.status === "completed") {
    return { error: "This appointment is already completed." };
  }

  const updated: Appointment = {
    ...existing,
    status,
    updatedAt: new Date().toISOString(),
  };

  appointments[index] = updated;
  await writeAppointments(appointments);

  return { appointment: updated };
}
