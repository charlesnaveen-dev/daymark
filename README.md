# DAYMARK — Personal Execution & Time Tracking System

A calm, focused personal productivity and manual time-tracking system built with React 19, TypeScript, Tailwind CSS, Framer Motion, Recharts, and Supabase.

**Product philosophy:** *Make every day count.*

---

## Core Features

- **Dashboard**: Greeting, daily motivational quote, today's Weekly Focus, animated 8h 30m focused-work ring (5h Agency + 3h 30m Music), separate break/personal/total recorded metrics, streak & weekly consistency, milestones, and chronological activity timeline.
- **Manual Time Tracker**: Primary manual entry workflow with automatic duration calculation, midnight-crossing support, overlap prevention, previous-date logging, and an optional secondary live timer.
- **My Daily Schedule**: Exact 10:00 AM – 11:15 PM daily schedule with live active-block highlighting and 7-day Weekly Focus Rotation.
- **Daily Review**: 11:00 PM reflection form with persistent review history.
- **History & Export**: Searchable, filterable log with edit/delete, CSV export, Monthly Summary CSV export, and print-friendly PDF report.
- **Analytics**: Interactive Recharts views for Daily (planned vs actual), Weekly, and Monthly reports with zero fabricated data.
- **Appearance**: Light, Dark, and System theme modes using `color-scheme`.

---

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. **Local Dev Mode**: If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not configured, DAYMARK automatically runs in **Local Dev Mode** using browser `localStorage` (clearly indicated in the UI).

---

## Supabase Setup (Cloud Sync & Auth)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and run:
   `supabase/migrations/001_initial_schema.sql`
3. Copy `.env.example` to `.env.local` and fill in your project credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Restart the dev server (`npm run dev`).

---

## Deploying to Vercel

1. Push the repository to GitHub/GitLab/Bitbucket.
2. Import the project in [vercel.com](https://vercel.com).
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in **Project Settings → Environment Variables**.
4. `vercel.json` is already configured for SPA client-side routing. Deploy!

---

## Scripts

- `npm run dev` — Start development server
- `npm run test` — Run unit tests (`vitest`)
- `npm run build` — Typecheck and build for production
