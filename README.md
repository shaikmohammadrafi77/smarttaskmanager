# Smart AI Task Organizer

Full-stack task management platform that combines a React dashboard with a Node.js/Express API, SQLite persistence, background reminder scheduling, and lightweight AI-powered task suggestions.

## Features

- User authentication with JWT-based sessions.
- Task CRUD with priorities, statuses, due dates, and reminders.
- Dashboard metrics, charts, and upcoming deadline feed.
- Calendar-style task grouping by due date.
- AI suggestion endpoint that infers priority and reminder times.
- Background scheduler that creates notification entries when reminders become due.
- Notification center with read/unread tracking.

## Project Structure

```
client/   # React + Vite single page application
server/   # Express API + SQLite + background jobs
```

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer

## Quick Start (VS Code)

### Step 1: Backend Setup

Open a terminal in VS Code (`Terminal → New Terminal`) and run:

```bash
cd server
npm install
npm run migrate
npm run seed
npm run dev
```

The backend will start on `http://localhost:5173`.

**Note:** The `.env` file is optional. If it doesn't exist, the app uses a default development secret (you'll see a warning, which is fine for development).

**Seed user credentials:** `admin@example.com` / `password123`

### Step 2: Frontend Setup

Open another terminal tab (`+` icon in the terminal panel) and run:

```bash
cd client
npm install
npm run dev
```

The frontend will start on `http://localhost:5174` (or the port shown in the terminal).

### Step 3: Open in Browser

Visit `http://localhost:5174` and log in with the seed credentials or register a new account.

---

## Detailed Setup

### Environment Configuration (Optional)

For production, create `server/.env` from `server/env.example`:

```
PORT=5173
JWT_SECRET=replace-with-strong-secret
SQLITE_PATH=./data/smart_ai_task_organizer.sqlite
```

**Note:** `.env` files are not committed to Git (see `.gitignore`). After cloning, the app works without `.env` using default development settings.

## Build for Production

```bash
cd client
npm run build
```

Deploy the compiled assets in `client/dist`. The API can be started with `npm start`.

## Scripts

### Server

- `npm run dev` – start Express with nodemon.
- `npm start` – start Express without file watching.
- `npm run migrate` – initialise SQLite schema.
- `npm run seed` – populate base demo data.

### Client

- `npm run dev` – start Vite dev server on port 5174.
- `npm run build` – production build.
- `npm run preview` – preview the production build locally.

## Testing the Reminder Flow

1. Create a task with `Remind At` within the next minute.
2. Keep the server running; the scheduler checks every 60 seconds.
3. A notification entry appears, and the UI badge updates on refresh (or every minute via polling).

## Deployment Notes

- Ensure `JWT_SECRET` remains private and sufficiently strong.
- When deploying behind a reverse proxy, adjust the Vite proxy or serve the SPA via the API server.
- SQLite is ideal for single-node deployments; for multi-instance setups migrate to PostgreSQL/MySQL and update the DB layer.


