# ToDoHi

ToDoHi is a full-stack productivity app designed as a daily execution companion. It combines tasks, planning, memo workflows, and motivational systems into one focused experience.

## Product Direction

ToDoHi is not intended to be a generic task tracker. It is designed to be:
- A daily workflow organizer
- A time-structure assistant
- A momentum and focus companion

The product philosophy is:
- Calm
- Structured
- Clear
- Motivating
- Personal

It should avoid enterprise-style complexity and help users execute their day intentionally.

## DailyPlanner Context

`DailyPlanner` (implemented in code as `Daily Plan` / `daily-plans`) is the execution layer of ToDoHi.

Important distinction:
- Tasks are core productivity objects (what must be done)
- DailyPlanner is the scheduling and execution layer (when and how work is done)

Example:
- Task: `Finish React Dashboard`
- DailyPlanner Session: `2:00 PM - 4:00 PM React Dashboard work block`

### Core DailyPlanner Goals
- Provide daily structure (morning/afternoon/evening/night or hourly timeline)
- Support time awareness (time blocks, duration, sequence)
- Reduce mental clutter through visual planning
- Reinforce momentum with realistic day execution

### ResetHour Alignment (Architecturally Critical)

DailyPlanner must align with ToDoHi reset-cycle logic.

A user day is defined by `resetHour`, not strict midnight. For example, if `resetHour=4`, the day window is `4:00 AM -> next day 3:59 AM`.

This must stay consistent across:
- Task deadlines
- Daily stats
- Repeat-task cycles
- Planner date/session handling

## Current Technical State

## Tech Stack

Frontend (`/frontend`):
- React 19 + TypeScript
- Vite 7
- React Router
- DnD Kit + hello-pangea/dnd
- Chart.js + react-chartjs-2
- Axios

Backend (`/backend`):
- Node.js + Express 5
- MongoDB + Mongoose
- JWT auth
- multer uploads
- node-cron scheduler
- express-rate-limit

## Monorepo Structure

- `backend/src/server.js`: app bootstrap, middleware, routes, scheduler startup
- `backend/src/models/`: Mongo models (`task`, `memo`, `dailyPlan`, `planHistory`, `user`, etc.)
- `backend/src/controllers/`: feature logic
- `backend/src/routes/`: API routing
- `backend/src/utils/`: scheduler, daily stats, helper modules
- `frontend/src/router/AppRouter.tsx`: route tree + protected routing
- `frontend/src/context/`: auth/todo/memo state layers
- `frontend/src/components/`: feature UI and modal systems
- `frontend/src/api/`: typed API clients
- `frontend/src/utils/`: domain utilities and pure helper logic

## Current Feature Modules

1. Authentication
- Register/login with JWT
- Protected `me` endpoint

2. Tasks
- CRUD + reorder + complete + repeat
- Deadline-aware failure flow

3. Daily Plan (DailyPlanner foundation)
- Create/fetch/edit/delete plan entries
- Update planned time
- Copy daily plan
- Mark day complete

4. Memo Board
- Memo CRUD
- Create memo from task
- Drag-and-drop layout with persisted positions

5. Quotes
- Categories
- Preference updates
- Randomized quote retrieval

6. Dashboard
- Stats panel
- Task/memo/daily-plan previews
- Repeat-cycle checks

## Scheduler Behavior

Scheduler runs every 5 minutes (`Asia/Manila`):
- Expires overdue pending tasks
- Detects per-user reset-cycle boundary
- Clears `repeatCycleAcknowledged`
- Runs daily stats logic
- Stores failed-task snapshots per user

Note: reset-cycle processing state is currently in-memory and resets on server restart.

## Refactoring and Utility Architecture

Refactoring is a core project need, not optional cleanup. ToDoHi now spans interconnected productivity systems (tasks, planner, stats, reset cycles, memos), and consistency is critical.

### Why Refactoring Matters Here
- Prevent resetHour logic drift across frontend and backend
- Keep planner/task/deadline behavior consistent as features grow
- Reduce duplicated business logic in controllers/components
- Make advanced planner features possible without regressions
- Improve onboarding speed and implementation confidence

### Current Utility-Driven Strengths

Backend utility patterns already in use:
- `backend/src/utils/helpers.js`
- `backend/src/utils/scheduler.js`
- `backend/src/utils/dailyStats.js`
- `backend/src/utils/memoBoard/*`

Frontend utility patterns already in use:
- `frontend/src/utils/resetCycle.ts`
- `frontend/src/utils/computeDeadline.ts`
- `frontend/src/utils/statsUtils.ts`
- `frontend/src/utils/taskUtils.ts`
- `frontend/src/utils/memoUtils/*`
- `frontend/src/utils/quoteUtils.ts`

These are good foundations and should be expanded deliberately.

### Refactoring Direction

1. Consolidate domain rules
- Centralize reset window/cycle logic to avoid mismatch between server and client behavior.

2. Keep helpers pure where possible
- Move calculation/transformation logic into pure utils.
- Keep controllers/components focused on orchestration.

3. Introduce service boundaries in backend
- Shift large controller logic into feature services (task service, planner service, stats service).

4. Strengthen shared contracts
- Align API payload shapes and date/time semantics across frontend/backend.

5. Build testable modules first
- Prioritize unit tests around resetHour windows, planner overlaps, deadline transitions, and scheduler cycle logic.

## DailyPlanner MVP Scope (Recommended)

- Dedicated planner page
- Add/edit/delete planner sessions
- Time-range support
- Optional linked task reference
- Timeline rendering
- ResetHour-aware day boundaries

Keep first release focused. Advanced intelligence can follow.

## Future DailyPlanner Extensions (Post-MVP)

- Overbook detection
- Focus balance suggestions
- Session analytics
- Productivity pattern insights
- Smart recommendations
- Burnout/rhythm warnings

These are intentional future directions, not immediate requirements.

## API Surface (High-Level)

Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

User:
- `PATCH /api/user/preference`
- `PATCH /api/user/upload-profile`

Tasks:
- `POST /api/tasks/`
- `GET /api/tasks/`
- `PUT /api/tasks/reorder`
- `PATCH /api/tasks/:id/complete`
- `PUT /api/tasks/:id`
- `POST /api/tasks/repeat`
- `DELETE /api/tasks/:id`

Daily Plans:
- `POST /api/daily-plans/create`
- `GET /api/daily-plans/:date`
- `PUT /api/daily-plans/edit/:date/:planId`
- `PUT /api/daily-plans/time/:date/:planId`
- `DELETE /api/daily-plans/:date/:planId`
- `POST /api/daily-plans/copy`
- `POST /api/daily-plans/complete`

Memo Board:
- `POST /api/memoboard/`
- `POST /api/memoboard/from-task`
- `GET /api/memoboard/`
- `PUT /api/memoboard/:id`
- `PATCH /api/memoboard/layout`
- `DELETE /api/memoboard/:id`

Quotes:
- `GET /api/quotes/categories`
- `GET /api/quotes/category/:category`
- `PUT /api/quotes/preferences`
- `GET /api/quotes/random`

Stats:
- `GET /api/stats/`

## Local Setup

Prerequisites:
- Node.js 18+
- npm
- MongoDB URI (local or Atlas)

Install:
```bash
cd backend && npm install
cd ../frontend && npm install
```

Backend env (`backend/.env`):
```env
MONGO_URI=<mongodb-uri>
JWT_SECRET=<secret>
PORT=3500
```

Run locally:
```bash
cd backend
npm run server

cd ../frontend
npm run dev
```

## Docker

Run both services with Docker Compose:
```bash
docker compose up --build
```

Current compose setup reads backend variables from `backend/.env`.

## Naming Note

Product language uses `DailyPlanner`; current API/model naming in code uses `daily-plans` / `DailyPlan`. Keep this mapping explicit during refactors to avoid confusion.

## Elevator Pitch

ToDoHi is a psychologically aware execution-layer productivity system that helps users structure, plan, and complete their day through task flow, time planning, and reset-cycle-aware momentum design.
