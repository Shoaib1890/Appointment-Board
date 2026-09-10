import { NextRequest, NextResponse } from "next/server";
import { getAllAppointments } from "@/lib/appointment-store";
import { AppointmentStatus } from "@/types/appointment";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const statusParam = searchParams.get("status");
    const status =
      statusParam && statusParam !== "all"
        ? (statusParam as AppointmentStatus)
        : undefined;

    const appointments = await getAllAppointments({ date, status });

    return NextResponse.json({
      success: true,
      data: appointments,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch appointments." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { createAppointment } = await import("@/lib/appointment-store");
    const result = await createAppointment(body);

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
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.appointment,
        message: "Appointment created successfully.",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create appointment." },
      { status: 500 }
    );
  }
}
