# Clover

**Every Leaf Has a Story.** A frontend-only prototype for a personal and shared life journal.

## Run it

1. Install [Node.js LTS](https://nodejs.org/).
2. In the project folder, run `npm install`.
3. Run `npm run dev` and open the local address Vite prints (normally `http://localhost:5173`).
4. For a production check, run `npm run build`.

## What is included

- Responsive onboarding, mock sign-in and personalised leaf colour setup.
- Dashboard with connected Clover member leaves and groups.
- Editable local diary with filtering and private/shared labels.
- Photo preview, microphone recording/playback (where browser permissions allow), and local draft saving.
- Editable calendar appointments and a large-text family care view.
- Clearly labelled Moments-to-Actions demonstration suggestions; it does **not** use AI.
- Settings, mock group creation, validation, empty states and browser `localStorage` persistence.

## Important prototype boundaries

There is no authentication, cloud storage, sharing, real invitation, database, AI interpretation or notification delivery. Browser localStorage is not secure and is not synchronised; clearing browser data may remove mock changes. See `SUPABASE-PLANNING.md` for the proposed future backend design.

## Upload to GitHub (`minnlinn/clover-app`)

1. Extract the provided ZIP, then sign in at [GitHub](https://github.com/).
2. Choose **New repository**, name it `clover-app`, choose visibility, and do **not** add a README (this project already has one).
3. On the new repository page, choose **uploading an existing file**, drag the *contents* of the extracted `clover-app` folder, then commit the upload.
4. Or from VS Code’s integrated terminal: run `git init`, `git add .`, `git commit -m "Initial Clover frontend"`, add the remote GitHub shows, and run `git push -u origin main`.

## VS Code and future Codex work

Install [VS Code](https://code.visualstudio.com/), choose **File → Open Folder**, and select `clover-app`. Install Node.js, then use its terminal for the commands above. Sign in to GitHub in VS Code when prompted. To use Codex or another coding assistant, connect/authenticate it with your GitHub account as that product instructs, open this repository, and ask for focused changes (for example: “add Supabase auth using the plan in SUPABASE-PLANNING.md”). Review diffs and run `npm run build` before committing through Source Control or the terminal.

To invite a teammate: open the GitHub repository → **Settings → Collaborators** → **Add people**, enter their GitHub username or email, choose the appropriate role, and send the invitation.

## Suggested roadmap

1. Confirm ILMUcode: Jom Bina Hackathon rules allow pre-built frontend work before submitting it.
2. Add Supabase auth, the schema/RLS policy, and real-time group sharing.
3. Add private object storage with signed URLs for photos and recordings.
4. Add consent-first AI processing, transparent review controls and audit history.
5. Add tested notifications, PWA offline behaviour, accessibility testing and end-to-end tests.

Never alter commit timestamps or represent pre-existing work as hackathon-week work.

## Team workflow

Use one repository with a stable `main` branch, a shared `frontend` branch for the user interface, and a shared `backend` branch for Supabase and server work. Make each task on a short-lived branch from its relevant shared branch, then submit a Pull Request for review rather than committing straight to `main`. See `CONTRIBUTING.md` for the complete workflow and `.github/pull_request_template.md` for the review checklist.
