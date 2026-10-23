# Hardware Garden

A beginner hardware learning website, installable web app, and native Android/iOS projects.

## Included

- 32 complete lessons across eight modules, with 96 quiz questions and step-by-step activities.
- Captioned animations with playback controls and interactive binary, gate, and circuit experiments.
- Eight procedural Three.js 3D hardware models with rotation, zoom, exploded views, selectable parts, and a 2D view. These are simplified illustrations, not device repair drawings.
- Searchable 107-term glossary, bookmarks, lesson completion, best quiz scores, and reading position.
- App username/password sign-in, optional Google/Apple providers, and D1 storage. Every progress operation derives ownership from the server session. Account confirmation prevents a pending offline request being written to a different signed-in account.
- Service-worker app shell and static-asset caching; device-local account-scoped progress survives restarts and synchronizes after reconnection. API responses are never cached by the service worker.

## Run locally

Requires Node 22.13 or later (Node 24 recommended for the built-in test tooling).

```sh
npm run install:ci
npm run db:generate
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_demonic_thanos.sql
npm run dev
```

Apply an existing migration only once to a given local database. Local preview is at http://127.0.0.1:5173. The starter legacy identity is simulated as Seedy on loopback development only. App account authentication uses the local database; apply both migrations and configure a local AUTH_SECRET.

## Verification

```sh
npx tsc --noEmit
node --experimental-strip-types --test tests/*.test.mjs
node tests/api-check.mjs
```

The API check requires the local development server. It checks authentication, invalid writes, origin protection, and account changes without altering lesson records. Database tests run the production upsert against an in-memory SQLite database, verifying account isolation and merge rules.

## Saving and offline behavior

Completion is never cleared by a stale write. Scores retain their best value. Reading position and bookmarks have separate timestamps; the latest change for each wins. All writes are idempotent database upserts. Local changes are persisted immediately, synced after a short delay, retried every 15 seconds and when online, and retried manually from the header. Offline browser storage is scoped by account. A newly verified online account replaces the current account context before any sync.

The site must be opened online once to cache its app shell. Open a 3D scene online once to cache its lazy-loaded model code. Installation depends on browser support: Android and desktop browsers can offer an install prompt; Safari on iPhone supports Share → Add to Home Screen. Native builds are described in MOBILE.md.

The owner authorized replacing the original ChatGPT-only gate with application sign-in. The website is publicly reachable; personal progress requires an authenticated account. Sites provisions the database and applies production migrations. Keep `.openai/hosting.json` and `drizzle/` with the source.

## Realistic viewer, dark mode, and native apps

The current viewer uses Three.js with complete procedural hardware models, metal materials, studio lighting, RGB memory, shadows, orbit controls, zoom, automatic framing, exploded assembly, and keyboard controls. A labeled CSS diagram remains available as a fallback. Watch lessons now animate the actual hardware model, including fan rotation and visible data-flow particles. Dark mode is the default; the header toggle remembers light/dark preference across visits.

See [MOBILE.md](MOBILE.md) for Android/iPhone builds and [AUTHENTICATION.md](AUTHENTICATION.md) for the account system and remaining provider configuration. The native app bundles course content and 3D scenes; it is more than a remote website wrapper.

## Learning helper

The floating learning helper offers Gemini answers, natural speech, visual flow steps, and course links. It uses server-only `GEMINI_API_KEY`, optional `GEMINI_MODEL` (default `gemini-3.8-flash`), and `GEMINI_VOICE_MODEL` (default `gemini-3.8-flash-tts`). API requests require sign-in and share a 30-request hourly account quota. Built-in course explanations and device speech remain available when disconnected. Questions and lesson context go to Google; no chat history is persisted.
