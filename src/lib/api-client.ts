import {
  ApiResponse,
  Appointment,
  AppointmentFilters,
  AppointmentInput,
  AppointmentStatus,
} from "@/types/appointment";

function buildQuery(filters: AppointmentFilters): string {
  const params = new URLSearchParams();
  if (filters.date) params.set("date", filters.date);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  const query = params.toString();
  return query ? `?${query}` : "";
}

async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    throw new Error(
      response.status === 500
        ? "Server error while loading appointments. Try refreshing the page."
        : `Request failed (${response.status}).`
    );
  }

  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    throw new Error("Invalid response from server. Try refreshing the page.");
  }
}

export async function fetchAppointments(
  filters: AppointmentFilters = {}
): Promise<Appointment[]> {
  const response = await fetch(`/api/appointments${buildQuery(filters)}`, {
    cache: "no-store",
  });
  const json = await parseApiResponse<Appointment[]>(response);
  if (!json.success || !json.data) {
    throw new Error(json.error || "Failed to load appointments.");
  }
  return json.data;
}

export async function createAppointmentApi(
  input: AppointmentInput
): Promise<{ appointment: Appointment; message: string }> {
  const response = await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json: ApiResponse<Appointment> & { fieldErrors?: Record<string, string> } =
    await response.json();

  if (!json.success) {
    if (json.fieldErrors) {
      const firstError = Object.values(json.fieldErrors)[0];
      throw new Error(firstError || json.error || "Validation failed.");
    }
    throw new Error(json.error || "Failed to create appointment.");
  }

  return {
    appointment: json.data!,
    message: json.message || "Appointment created successfully.",
  };
}

export async function updateAppointmentApi(
  id: string,
  input: AppointmentInput
): Promise<{ appointment: Appointment; message: string }> {
  const response = await fetch(`/api/appointments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json: ApiResponse<Appointment> & { fieldErrors?: Record<string, string> } =
    await response.json();

  if (!json.success) {
    if (json.fieldErrors) {
      const firstError = Object.values(json.fieldErrors)[0];
      throw new Error(firstError || json.error || "Validation failed.");
    }
    throw new Error(json.error || "Failed to update appointment.");
  }

  return {
    appointment: json.data!,
    message: json.message || "Appointment updated successfully.",
  };
}

export async function updateAppointmentStatusApi(
  id: string,
  status: Extract<AppointmentStatus, "completed" | "cancelled">
): Promise<{ appointment: Appointment; message: string }> {
  const response = await fetch(`/api/appointments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const json: ApiResponse<Appointment> = await response.json();

  if (!json.success) {
    throw new Error(json.error || "Failed to update appointment status.");
  }

  return {
    appointment: json.data!,
    message: json.message || "Status updated successfully.",
  };
}
