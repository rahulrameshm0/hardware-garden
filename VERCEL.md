# Vercel deployment

The production frontend and Android download are hosted on Vercel. Build with `npm run web:build`; output is `vercel-dist`. The existing Cloudflare-hosted API and D1 database remain the backend, preserving account identities, quiz results, bookmarks, and progress. This is a frontend hosting migration, not a database migration.

`api/index.ts` is a same-origin server gateway. Vercel's secret `HG_PROXY_SECRET` must match the backend secret `WEB_PROXY_SECRET`. `HG_PUBLIC_ORIGIN` and backend `WEB_PUBLIC_ORIGIN` must both equal the canonical production HTTPS origin. Only authenticated gateway requests can change the backend's public authentication origin. All API responses bypass caching. The Android app can continue using its existing backend directly.

Register the Vercel origin's `/api/auth/callback/google` URL in the existing Google Web OAuth client. Keep the previous callback for installed Android apps and the existing site. Keep Gemini and authentication secrets on the backend; do not expose them to frontend build variables.

The release APK is copied from ignored `release/Hardware-Garden-2.1.apk` into the download directory if present. `.vercelignore` allows the binary for deployment while `.gitignore` keeps it out of source control. The original release artifact remains available in the private repository's Actions run.
