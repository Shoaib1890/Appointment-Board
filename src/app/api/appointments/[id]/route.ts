import { NextRequest, NextResponse } from "next/server";
import {
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
} from "@/lib/appointment-store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const appointment = await getAppointmentById(id);

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: appointment });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch appointment." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = await updateAppointment(id, body);

    if (result.fieldErrors) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed.",
          fieldErrors: result.fieldErrors,
        },
        { status: 400 }
      );
    }

    if (result.error) {
      const status = result.error.includes("not found") ? 404 : 409;
      return NextResponse.json({ success: false, error: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      data: result.appointment,
      message: "Appointment updated successfully.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update appointment." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body as { status?: "completed" | "cancelled" };

    if (!status || (status !== "completed" && status !== "cancelled")) {
      return NextResponse.json(
        { success: false, error: "Invalid status. Use 'completed' or 'cancelled'." },
        { status: 400 }
      );
    }

    const result = await updateAppointmentStatus(id, status);

    if (result.error) {
      const statusCode = result.error.includes("not found") ? 404 : 400;
      return NextResponse.json({ success: false, error: result.error }, { status: statusCode });
    }

    const message =
      status === "completed"
        ? "Appointment marked as completed."
        : "Appointment cancelled successfully.";

    return NextResponse.json({
      success: true,
      data: result.appointment,
      message,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update appointment status." },
      { status: 500 }
    );
  }
}
