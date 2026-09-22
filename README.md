# Appointment Board

**Appointment Board** is a full-stack web application for managing a shared team schedule. It provides a single place to view, create, and update appointments with clear status tracking, filtering, and conflict-aware scheduling so overlapping bookings are prevented before they reach the database.

**Live demo:** [https://appointment-board-five.vercel.app](https://appointment-board-five.vercel.app)

---

## Overview

Teams often coordinate meetings and client slots across spreadsheets or ad hoc messages, which makes double-bookings and stale status hard to avoid. This project implements a focused scheduling board: appointments are listed in a responsive UI, filtered by date and status, and backed by a REST API with shared validation rules on the client and server.

The application demonstrates end-to-end product work—typed React UI, Next.js API routes, domain logic (overlap detection, lifecycle rules), persistence, and deployment—without relying on a separate backend framework or external database for the demo.

---

## Highlights

| Area | What it shows |
|------|----------------|
| **UX** | Board layout, modals for create/edit/detail, confirmation flows, loading skeletons, and toast feedback |
| **Domain logic** | Half-open time intervals `[start, end)`, overlap checks, and status-specific rules (cancelled vs completed) |
| **API design** | RESTful routes with consistent JSON responses, query filters, and PATCH for status transitions |
| **Quality** | TypeScript throughout, ESLint, shared validators used in UI and API layers |
| **Ops** | Production build on Vercel; local file storage with seed data for immediate evaluation |

---

## Features

- **Dashboard view** — Appointments displayed in a responsive card grid with at-a-glance stats (scheduled, completed, cancelled).
- **CRUD operations** — Create and edit appointments; view details in a dedicated modal.
- **Status workflow** — Mark appointments as completed or cancelled with appropriate UI constraints (e.g. cancelled items are not editable).
- **Filtering** — Filter by date and status; quick filters from stat cards.
- **Scheduling rules** — Prevents overlapping time slots for active appointments using `[start, end)` semantics.
- **Cancelled vs completed** — Cancelled appointments stay visible for history but do not block new slots; completed appointments remain visible and still occupy their time range.
- **Validation** — Required fields, date/time formats, and end-after-start checks on both client and server.
- **Persistence** — JSON file storage with sample data seeded on first run.
- **Feedback** — Success and error toasts for user actions.

---

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS 4](https://tailwindcss.com/) |
| **Backend** | Next.js Route Handlers (`/api/appointments`) |
| **Storage** | Local JSON file (`data/appointments.json` in development) |
| **Tooling** | ESLint, `uuid` for identifiers |

---

## Architecture

```
Browser (React client components)
        │
        ▼
  api-client.ts  ──►  /api/appointments  ──►  appointment-store.ts
        │                      │                      │
        │                      │                      ▼
        │                      │              appointment-utils.ts
        │                      │              (validation, overlap)
        ▼                      ▼
  Shared types (src/types)     JSON persistence
```

- **UI layer** (`src/components/`) — Composable components for the board, filters, modals, and notifications.
- **API layer** (`src/app/api/`) — HTTP handlers delegate to the store and return typed `ApiResponse` payloads.
- **Domain layer** (`src/lib/appointment-utils.ts`) — Pure functions for validation and conflict detection, reused by the store and forms.

---

## Getting Started

### Prerequisites

- **Node.js** 18 or later  
- **npm** (comes with Node)

### Installation

```bash
git clone https://github.com/Shoaib1890/Appointment-Board.git
cd appointment-board
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first run, the app seeds representative appointments so the board is usable immediately.

### Production build (local)

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## API Reference

Base path: `/api/appointments`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/appointments?date=&status=` | List appointments; optional `date` (YYYY-MM-DD) and `status` filters |
| `POST` | `/api/appointments` | Create appointment (JSON body: title, description, date, startTime, endTime) |
| `GET` | `/api/appointments/:id` | Fetch one appointment by ID |
| `PUT` | `/api/appointments/:id` | Update fields (not allowed when status is cancelled) |
| `PATCH` | `/api/appointments/:id` | Update status (`completed` or `cancelled`) |

Responses follow a consistent shape: `{ success, data?, error?, message? }`.

---

## Scheduling & Business Rules

Understanding these rules clarifies how conflicts and statuses behave:

1. **Time intervals** — Slots use half-open ranges `[start, end)`: an appointment ending at 10:00 does not overlap one starting at 10:00.
2. **Conflict detection** — Only non-cancelled appointments participate in overlap checks when creating or updating times.
3. **Completed appointments** — Remain on the board and still reserve their slot (useful for audit and capacity planning in a single-team demo).
4. **Cancelled appointments** — Visible for history; slots become available for new bookings; records cannot be edited afterward.
5. **Single board** — No authentication; intended as a shared team view for portfolio and demo use.

---

## Deployment Notes

- **Vercel** — The live demo runs on Vercel. Serverless instances use `/tmp` for JSON storage, which may reset on cold starts; data is suitable for demonstration, not long-term production retention without an external database.
- **Local** — Data persists in `data/appointments.json` across restarts.

---

## Project Structure

```
src/
├── app/
│   ├── api/appointments/       # REST route handlers
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Entry: AppointmentBoard
├── components/                 # UI (board, cards, modals, filters, toast)
├── lib/
│   ├── api-client.ts           # Fetch wrappers for the API
│   ├── appointment-store.ts    # Persistence & CRUD
│   ├── appointment-utils.ts    # Validation & overlap logic
│   ├── form-defaults.ts
│   └── toast-messages.ts
└── types/
    └── appointment.ts          # Shared TypeScript models
```
