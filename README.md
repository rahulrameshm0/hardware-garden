# Hardware Garden

A private learning website and installable mobile web app for complete beginners.

## Included

- 32 complete lessons across eight modules, with 96 quiz questions and step-by-step activities.
- Captioned animations with playback controls and interactive binary, gate, and circuit experiments.
- Eight procedural CSS 3D hardware models with rotation, zoom, exploded views, selectable parts, and a 2D view. These are simplified illustrations, not device repair drawings.
- Searchable 107-term glossary, bookmarks, lesson completion, best quiz scores, and reading position.
- ChatGPT sign-in and D1 storage. Every progress operation derives ownership from the server session. Account confirmation prevents a pending offline request being written to a different signed-in account.
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

Apply an existing migration only once to a given local database. Local preview is at http://127.0.0.1:5173. The starter simulates sign-in as Seedy on loopback development only; production sign-in is provided by Sites.

## Verification

```sh
npx tsc --noEmit
node --experimental-strip-types --test tests/*.test.mjs
node tests/api-check.mjs
```

The API check requires the local development server. It checks authentication, invalid writes, origin protection, and account changes without altering lesson records. Database tests run the production upsert against an in-memory SQLite database, verifying account isolation and merge rules.

## Saving and offline behavior

Completion is never cleared by a stale write. Scores retain their best value. Reading position and bookmarks have separate timestamps; the latest change for each wins. All writes are idempotent database upserts. Local changes are persisted immediately, synced after a short delay, retried every 15 seconds and when online, and retried manually from the header. Offline browser storage is scoped by account. A newly verified online account replaces the current account context before any sync.

The site must be opened online once to cache its app shell. Open a 3D scene online once to cache its lazy-loaded model code. Installation depends on browser support: Android and desktop browsers can offer an install prompt; Safari on iPhone supports Share → Add to Home Screen. No app-store package is included.

The initial publication is owner-private. Sites owns hosted sign-in, database provisioning, and production migrations. Keep `.openai/hosting.json` and `drizzle/` with the source. Do not implement custom sign-in endpoints or change the access policy to work around authentication errors.

## Realistic viewer, dark mode, and native apps

The current viewer uses Three.js with complete procedural hardware models, metal materials, studio lighting, RGB memory, shadows, orbit controls, zoom, automatic framing, exploded assembly, and keyboard controls. A labeled CSS diagram remains available as a fallback. Watch lessons now animate the actual hardware model, including fan rotation and visible data-flow particles. Dark mode is the default; the header toggle remembers light/dark preference across visits.

See [MOBILE.md](MOBILE.md) for Android/iPhone builds and [AUTHENTICATION.md](AUTHENTICATION.md) for the account system and remaining provider configuration. The native app bundles course content and 3D scenes; it is more than a remote website wrapper.
