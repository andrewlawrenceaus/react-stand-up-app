# Stand-Up Duck

A web app for running team stand-up meetings and retrospectives. Create teams, manage participants, step through each person's update with a duck-themed interface, and run async-friendly retros with real-time collaboration.

**Live app:** https://stand-up-duck.web.app

---

## Features

- Email/password authentication
- Create and manage teams with named participants
- Interactive stand-up runner — pass the duck to each participant in turn
- Participants who aren't ready get requeued for the end
- **Retrospectives** — run real-time retros with customisable categories, item voting, a countdown timer, and action item tracking
- Data persists across sessions via Firebase Realtime Database

## Tech Stack

- **Frontend:** React 18, React Router 6, Material UI 5
- **Build:** Vite 5
- **Backend:** Firebase (Authentication + Realtime Database)
- **Tests:** Jest + React Testing Library (unit), Playwright (E2E)
- **Deploy:** Firebase Hosting via GitHub Actions

---

## Getting Started

```bash
npm install
npm start        # Dev server → http://localhost:5173
```

Sign up for an account on first use — all team data is stored per user.

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start Vite dev server |
| `npm run build` | Build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Jest unit tests (watch mode) |
| `npm run test:coverage` | Run Jest with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run E2E tests in Playwright's interactive UI |

---

## Tests

### Unit Tests (Jest)

Tests cover hooks, components, utilities, and pages. Run them with:

```bash
npm test
```

Firebase is mocked at the module level in all unit tests — no Firebase project or credentials needed.

### E2E Tests (Playwright)

End-to-end tests cover authentication, team management, the full stand-up flow, and the retro feature. The E2E build uses `vite.e2e.config.js`, which swaps the Firebase SDK for in-memory mocks backed by `localStorage`. No Firebase credentials are required.

```bash
# First time only — install browser binaries
npx playwright install chromium

npm run test:e2e
```

The Playwright web server starts automatically using the mock Vite config.

---

## Deployment

Pushes to `main` deploy automatically to Firebase Hosting via GitHub Actions. Pull requests create a preview channel.

The workflow requires a `FIREBASE_SERVICE_ACCOUNT_STAND_UP_DUCK` secret in the repository settings.

To deploy manually:

```bash
npm run build
npx firebase deploy
```

### Firebase Storage rules

Storage security rules are kept in [`storage.rules`](storage.rules) and referenced in [`firebase.json`](firebase.json). Deploy them with:

```bash
firebase deploy --only storage
```

This requires the Firebase CLI (`npm install -g firebase-tools`) and an authenticated session (`firebase login`). It must be run at least once on a fresh Firebase project before photo uploads will work, and again whenever `storage.rules` is changed.

### CORS configuration

CORS rules are kept in [`cors.json`](cors.json) and must be applied to the Storage bucket separately using the Google Cloud CLI:

```bash
gcloud storage buckets update gs://stand-up-duck.firebasestorage.app --cors-file=cors.json
```

This is required once on a fresh project, and again whenever `cors.json` is changed. Without it, photo uploads will be blocked by the browser.

---

## Project Structure

```
src/
├── components/
│   ├── auth/           # Login/signup form
│   ├── header/         # Navigation bar
│   ├── manage-teams/   # Team and participant management UI
│   ├── retro/          # Retrospective board, setup, timer, and item components
│   ├── run-stand-up/   # Stand-up runner UI
│   └── store/          # Auth context provider
├── hooks/              # useInput form validation hook
├── pages/              # Route-level components and loaders
└── utils/
    ├── firebase.js     # Firebase SDK initialisation
    ├── db-utils.js     # Realtime Database read/write helpers
    └── mocks/          # In-memory Firebase mocks for E2E tests

e2e/
├── fixtures/           # Playwright auth fixture (mock-injected user)
├── auth.spec.js
├── team-management.spec.js
├── run-stand-up.spec.js
└── retro.spec.js
```
