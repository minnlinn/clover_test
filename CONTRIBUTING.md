# Working together on Clover

This project uses one GitHub repository and separate branches so frontend and backend work do not overwrite each other.

## Branches

- `main`: stable, reviewed work only.
- `frontend`: pages, React components, CSS, responsive design and browser-only interactions.
- `backend`: Supabase, database migrations, authentication, APIs, storage and server-side integrations.

Do not commit directly to `main`. Create a short-lived branch from the appropriate shared branch for each piece of work, such as `frontend/calendar-redesign` or `backend/appointments-schema`.

## Starting work

1. Get the newest work: `git checkout frontend` (or `backend`), then `git pull`.
2. Create your task branch: `git checkout -b frontend/short-description`.
3. Run `npm.cmd install` once after cloning or when `package.json` changes.
4. Start the app with `npm.cmd run dev` and check the change in the browser.

## Before a pull request

1. Run `npm.cmd run build`.
2. Keep the scope focused. Do not mix unrelated visual and database changes.
3. Never commit `.env`, API keys, service-role keys, real health details or private media.
4. Describe testing and any future-backend assumptions in the pull request.

## Working with AI coding assistants

AI can help write code, but the person committing remains responsible for reviewing its changes, testing locally and ensuring no secrets or fabricated claims are included. Give the assistant a focused request and tell it which branch/layer it may edit.

## Integration boundary

Until the backend is ready, frontend work should keep mock data in `src/data/` and use small service interfaces in `src/services/`. Backend changes should preserve or document the expected shape of profiles, entries, groups and appointments before asking frontend work to adopt them.
