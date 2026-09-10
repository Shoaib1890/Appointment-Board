# Appointment Board

A full-stack team appointment scheduling app built for a Full Stack Developer Intern submission.

## Features

- View appointments in a responsive board UI
- Add, edit, complete, and cancel appointments
- Filter by date and status
- Overlap prevention with `[start, end)` time ranges
- Cancelled appointments remain visible but do not block slots
- Completed appointments remain visible and still reserve their slot
- Client and server-side validation
- Persistent JSON storage with seeded sample data
- Success/error toast notifications

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Storage:** Local JSON file (`data/appointments.json`)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Live Demo

https://appointment-board-five.vercel.app

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments?date=&status=` | List appointments with optional filters |
| POST | `/api/appointments` | Create a new appointment |
| GET | `/api/appointments/:id` | Get a single appointment |
| PUT | `/api/appointments/:id` | Update an appointment |
| PATCH | `/api/appointments/:id` | Mark as completed or cancelled |

## Assumptions

- Single shared team board (no authentication)
- Time slots use half-open intervals: `[start, end)`
- Only non-cancelled appointments block overlapping slots
- Completed appointments still occupy their original time slot
- Cancelled appointments cannot be edited
- Data persists in `data/appointments.json` locally and survives refreshes
- On Vercel, data uses `/tmp` storage (resets on cold starts; suitable for demo)
- Sample appointments are auto-seeded on first run

## Project Structure

```
src/
├── app/
│   ├── api/appointments/     # REST API routes
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/               # UI components
├── lib/                      # Business logic & API client
└── types/                    # TypeScript types
```
