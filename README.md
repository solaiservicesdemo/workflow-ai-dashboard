# Workflow AI Dashboard (SOLAI AI Assistant Services)

A full-stack TypeScript app with a React SPA frontend and an Express backend, built on Vite.

This project currently provides a branded dashboard experience with two chat interfaces, speech-to-text input, file attachment metadata support, local session persistence, and external AI webhook integrations.

## Tech Stack

- Frontend: React 18, React Router 6, TypeScript, TailwindCSS 3
- Backend: Express 4 (mounted in Vite dev server, standalone in production)
- Build tooling: Vite 6, SWC
- UI primitives: Radix UI + shadcn/ui component files
- Data/query utilities: TanStack React Query (provider configured)
- Testing: Vitest
- Deployment options: Node server build and Netlify Functions

## Features and Functionalities

### Core App Features

- Single-page React app with client-side routing.
- Shared header with dark mode toggle persisted in `localStorage`.
- Home dashboard page (`/`) with:
- Social/integration launch cards (Telegram, Gmail, X, Instagram, Website, Facebook, Supabase, Google Drive, Google Calendar).
- Notifications panel (static items).
- Workflow analytics panel (static KPI cards + visual bar chart).
- Market analysis panel (static trend cards + indicators).
- Embedded chat panel and fixed bottom quick-input bar.
- Full-screen AI chat page (`/ai-chat`) with advanced controls.
- Fallback 404 route for unknown paths.

### AI Chat Capabilities

- Two chat surfaces sharing the same local storage history key (`solai-chat-messages`):
- Embedded dashboard chat on `/`.
- Full chat workspace on `/ai-chat`.
- Chat session lifecycle management:
- Session ID generation via `crypto.randomUUID()` fallback UUID implementation.
- Session persisted in `localStorage` (`solai-chat-session`).
- Auto-reset after 30 minutes of inactivity.
- Refresh handling that resets stored session/messages on fresh load detection.
- User message send with Enter key support.
- Bot response rendering with timestamps.
- Network/API error handling with user-friendly fallback messages.
- Auto-scroll to latest messages.

### Voice Input (Speech-to-Text)

- Browser speech recognition support check (`SpeechRecognition`/`webkitSpeechRecognition`).
- HTTPS/localhost enforcement message for browser compatibility requirements.
- Microphone permission request via `getUserMedia`.
- Recording state UI and start/stop behavior.
- Error mapping for common speech errors:
- `network`
- `not-allowed`
- `no-speech`
- `audio-capture`
- `service-not-allowed`

### File Attachment UX (`/ai-chat`)

- Multi-file picker support.
- Attached file preview list with name and size.
- Remove attached file before sending.
- Accepted file types:
- `.pdf`, `.doc`, `.docx`, `.txt`, `.csv`, `.xlsx`, `.jpg`, `.jpeg`, `.png`, `.gif`
- File metadata is included in webhook payload (`filename`, `size`, `type`).

Note: file binary upload is not implemented; current integration sends metadata only.

### AI Tool Selection (`/ai-chat`)

- Tool intent toggles for request routing metadata:
- `general`
- `database`
- `calendar`
- `email`
- `web`
- Selected tool is sent as `selectedTool` in webhook payload and resets to `general` after send.

### Webhook Integrations

- Home chat webhook:
- `POST https://solaiservicesdemo.app.n8n.cloud/webhook/chat`
- Full chat webhook:
- `POST https://solaiservicesdemo.app.n8n.cloud/webhook/assistant-pr-v2`
- Payload fields include message/session context and mode/tool metadata.

### Backend/API Features

- Express server with middleware:
- CORS enabled.
- JSON and URL-encoded body parsing.
- API endpoints:
- `GET /api/ping` returns service message.
- `GET /api/demo` returns typed demo payload.
- Shared API interface in `shared/api.ts` (`DemoResponse`).

### Production Server Features

- Server build target for Node 22 (`vite.config.server.ts`).
- Static serving of SPA from `dist/spa`.
- React Router fallback to `index.html` for non-API routes.
- API-route guard on wildcard fallback (`/api/*` and `/health` return 404 JSON if unmatched).
- Graceful shutdown handlers for `SIGTERM` and `SIGINT`.

### Netlify Serverless Support

- Netlify function wrapper using `serverless-http` around Express app.
- Redirect rule maps `/api/*` to `/.netlify/functions/api/:splat`.
- Netlify build publishes SPA from `dist/spa`.

### Styling and Theming

- TailwindCSS tokenized theme via CSS variables in `client/global.css`.
- SOLAI brand color tokens (`--solai-blue`, `--solai-pink`, etc.).
- Class-based dark mode.
- Extensive pre-generated Radix/shadcn UI component library under `client/components/ui`.

### Utilities and Testing

- `cn()` utility for class composition using `clsx` + `tailwind-merge`.
- Vitest test suite for `cn()` behavior.

## Routes

- `/` Home dashboard with embedded chat and panels.
- `/ai-chat` Full-screen AI chat interface.
- `*` Not Found page.

## API Endpoints

- `GET /api/ping`
- Response example:
```json
{ "message": "Hello from Express server v2!" }
```

- `GET /api/demo`
- Response example:
```json
{ "message": "Hello from Express server" }
```

## Project Structure

```txt
client/
  App.tsx
  global.css
  pages/
    Index.tsx
    AiChat.tsx
    NotFound.tsx
  components/
    Header.tsx
    ui/
  hooks/
  lib/

server/
  index.ts
  node-build.ts
  routes/
    demo.ts

shared/
  api.ts

netlify/
  functions/
    api.ts
```

## Local Development

Prerequisites:

- Node.js 22+ recommended
- npm

Install and run:

```bash
npm install
npm run dev
```

Dev server runs on:

- `http://localhost:8080`

## Scripts

- `npm run dev` Start Vite dev server with Express middleware.
- `npm run build` Build client + server outputs.
- `npm run build:client` Build SPA into `dist/spa`.
- `npm run build:server` Build Node server bundle into `dist/server`.
- `npm run start` Run production Node server (`dist/server/node-build.mjs`).
- `npm run test` Run Vitest tests once.
- `npm run typecheck` Run TypeScript checks.
- `npm run format.fix` Format repository with Prettier.

## Build and Run Production

```bash
npm run build
npm run start
```

Default production port:

- `PORT` env var if set
- Otherwise `3000`

## Configuration and Aliases

TypeScript/Vite path aliases:

- `@/*` -> `client/*`
- `@shared/*` -> `shared/*`

Tailwind configuration:

- `tailwind.config.ts`
- Theme tokens in `client/global.css`

## UI Component Inventory

The project includes a large generated UI set (Radix/shadcn style), including:

- accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb
- button, calendar, card, carousel, chart, checkbox, collapsible, command
- context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp
- label, menubar, navigation-menu, pagination, popover, progress, radio-group
- resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider
- sonner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip

## Data Persistence Keys

Client `localStorage`/`sessionStorage` usage:

- `darkMode`
- `solai-chat-session`
- `solai-chat-messages`
- `solai-navigation-flag` (session storage)

## Known Limitations / Current State

- Analytics/notifications/market cards are currently static UI data.
- Search icon in header is visual only (no search behavior yet).
- File attachments are metadata-only in webhook payload (no binary upload transport).
- Chat IDs are generated as `messages.length + 1`, which can collide in certain update timings.
- `professionalMode` state is currently defaulted true with no visible toggle in UI.
- Some dependencies are scaffolded for broader UI use and are not all exercised in current pages.

## Deployment Notes

### Node Server

- Use `npm run build` then `npm run start`.
- Express serves both API routes and built SPA.

### Netlify

- `netlify.toml` is configured to:
- build client with `npm run build:client`
- publish `dist/spa`
- route `/api/*` to Netlify function wrapper around the Express server

## AGENTS.md Guidance Followed

- Server endpoints are minimal and only used where server-side handling is needed.
- Client-first architecture remains primary for UI/chat workflows.

