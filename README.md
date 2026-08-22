# Organica

![React](https://img.shields.io/badge/react-v18.3.1-blue.svg)
![Vite](https://img.shields.io/badge/vite-v5-purple.svg)
![Firebase](https://img.shields.io/badge/firebase-v10-orange.svg)

A notes and tasks app built around organizing, not just capturing — folders with custom colors, a pinned "focus note" for the one list you keep coming back to, and a theme picker (Dracula, Nord, Solarized, Gruvbox, Catppuccin, and a couple of plain ones) instead of a single fixed look.

## Features

- **Text and checklist notes**, with autosave and a visible save state.
- **Folders** (tags): custom colors, drag-to-reorder, drag-a-note-onto-a-folder on desktop, rename via long-press on mobile or a pencil button on desktop, and folders can be hidden from the main list without deleting them.
- **Pin, favorite, and archive** notes; delete goes through a 5-second undo toast rather than disappearing immediately.
- **Focus note** — pin one note (usually a checklist) so it stays reachable everywhere as a small floating panel, or expand it fullscreen to edit without leaving whatever you were doing.
- **Search and sort** — search across title and content; sort by title, created date, modified date, due date, or reminder, ascending or descending.
- **Library filters** — All, Pinned, Favorites, Tasks, Notes only, Uncategorized, Archived — reorderable, relabelable, and some can be turned off in Settings.
- **Installable PWA** — works offline (Firestore's IndexedDB persistence), and can be added to a phone's home screen with direct "new note" / "new checklist" shortcuts.
- **Settings**: theme palette (light and dark variants of Monochrome, Slate, Dracula, Nord, Solarized, Gruvbox, and Catppuccin), separate font size for desktop and mobile, date format, and an identicon avatar.
- **Responsive by layout, not just by squeezing** — a 3-column workspace on desktop, a single-panel-plus-bottom-nav shell on mobile.

## Tech stack

- **React 18** + **Vite** for the app and dev server.
- **React Router v6** for routing and auth-gated routes.
- **Firebase** — Authentication (email/password) and Firestore (notes + folder metadata), with offline persistence enabled.
- **MUI** (Dialog, Menu, icons) alongside a large amount of hand-written CSS — MUI is not used for the app's general styling, just a handful of specific widgets.
- **Playwright** for end-to-end tests, plus `@axe-core/playwright` for automated accessibility checks.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/alancleetus/Organica.git
   cd Organica
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up Firebase config.** The app won't start meaningfully without this — create a `.env` file in the project root with your Firebase project's web config:
   ```bash
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   ```
   You'll also need Firestore rules that scope `notes` and `tags` documents to `request.auth.uid`, and Email/Password sign-in enabled in Firebase Authentication.
4. **Start the dev server:**
   ```bash
   npm run dev
   ```
   Then open `http://localhost:5173`.

## Available scripts

- `npm run dev` / `npm start` — start the Vite dev server.
- `npm run build` — production build to `dist/`.
- `npm run preview` — serve the production build locally.
- `npm run lint` — ESLint over the whole project.

## Project structure

```
src/
  components/       React components (NotesManager.jsx is the main workspace)
    auth/           Login, route guards, Firebase auth wiring
  utils/            Firestore CRUD (notesCrud, tagsCrud) and other helpers
  index.jsx         Entry point
public/
  styles/           Hand-written CSS, one file per concern
  icons/            PWA icons (regular + maskable)
  manifest.json     PWA manifest
tests/
  auth/             Playwright specs that run against a logged-in session
  unauth/            Playwright specs for login/route-guard behavior
```

## Testing

The `tests/` directory is a Playwright end-to-end suite that runs against a real Firebase backend (a dedicated test account, not mocked), covering:

- Login, invalid-login error handling, and route guards (authenticated users can't see `/login`, unauthenticated users can't see `/main`).
- Creating, editing, and deleting notes, including that changes survive a page refresh.
- Automated accessibility checks (WCAG 2 A/AA) on the login and main screens via axe-core.

```bash
npx playwright install
npx playwright test
npx playwright show-report
```

Tests expect `E2E_EMAIL` / `E2E_PASSWORD` env vars for a Firebase test account (see `tests/auth.setup.ts`), and rely on the same `VITE_FIREBASE_*` config as the app itself.

## Acknowledgements

Organica started as a course project modeled on Google Keep, then was rebuilt from that base into its current form.

## Contact

Questions or feedback: [alancleetus](https://github.com/alancleetus).
