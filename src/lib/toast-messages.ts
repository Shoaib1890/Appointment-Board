import { Appointment } from "@/types/appointment";

export function createdToast(appointment: Appointment) {
  return {
    title: "Appointment created",
    message: `${appointment.title} was added to your schedule.`,
  };
}

export function updatedToast(appointment: Appointment) {
  return {
    title: "Appointment updated",
    message: `${appointment.title} was saved successfully.`,
  };
}

export function completedToast(appointment: Appointment) {
  return {
    title: "Appointment completed",
    message: `${appointment.title} marked as completed.`,
  };
}

export function cancelledToast(appointment: Appointment) {
  return {
    title: "Appointment cancelled",
    message: `${appointment.title} was cancelled.`,
  };
}
