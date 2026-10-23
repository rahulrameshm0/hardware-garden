# Authentication setup

Hardware Garden includes its own database-backed account system using Better Auth, with usernames/passwords, optional Google/Apple OAuth, persistent rate limits, secure cookies, and signed mobile bearer sessions. No Supabase or Firebase account is needed for the self-hosted account database.

## Runtime configuration

Set production values using the hosting secret manager. `.dev.vars` is local-only and ignored. Never commit credentials.

| Key | Purpose |
| --- | --- |
| `AUTH_SECRET` | Strong server session secret; configured in Sites. |
| `AUTH_BASE_URL` | Canonical HTTPS site origin; configured in Sites. |
| `GOOGLE_CLIENT_ID` | Google web OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret; store as a secret. |
| `APPLE_CLIENT_ID` | Apple Services ID. |
| `APPLE_CLIENT_SECRET` | Signed Apple client-secret JWT; store as a secret. |
| `APPLE_APP_BUNDLE_IDENTIFIER` | `com.hardwaregarden.learn` for the native app. |

The app enables OAuth buttons only when their server credentials are configured. Passwords require at least 12 characters and are hashed by Better Auth. Rate limits persist in D1. Account linking by matching an unverified email is disabled. Account recovery email delivery is not configured; it requires an owner-selected email provider before offering password reset or verification flows.

## Google

A separate Google Cloud project named **Hardware Garden** (`hardware-garden`) was created in the signed-in Google account. OAuth onboarding and credentials are not complete. Finish Google Auth Platform branding and any required policy acceptance in the owner's console. Create a Web application client with this redirect URI:

`https://hardware-garden-rahul.rahulrameshm98.chatgpt.site/api/auth/callback/google`

For local testing also register `http://127.0.0.1:5173/api/auth/callback/google`. Request only basic sign-in scopes. Add the intended test user while the OAuth app remains in testing. Native system-browser sign-in uses this same web client.

## Apple

Apple requires an active Apple Developer account, an App ID with Sign in with Apple, a Services ID, a verified domain, Team ID, Key ID, and a signing key. Register this callback:

`https://hardware-garden-rahul.rahulrameshm98.chatgpt.site/api/auth/callback/apple`

Generate the client-secret JWT from the developer signing key and rotate it before its maximum six-month expiry. Keep the `.p8` key outside the repository. No Apple credentials or developer membership were available during implementation.

## Hosting boundary

The existing Site remains owner-private. Its platform-level ChatGPT gate precedes app login. To replace ChatGPT-only access, the owner must authorize a hosting policy change or select another host for the same backend. The app's own API already enforces account ownership, but the current platform gate is intentionally preserved until that decision is made.

Existing ChatGPT learning records remain in their original namespace. New app accounts have a separate account namespace; account data is never transferred just because email strings match.

## Local verification

Apply `drizzle/0001_brown_bastion.sql` after the original migration, restart development so `.dev.vars` loads, then run `node tests/account-api-check.mjs`. This uses a disposable local test account and checks username authentication, account-owned progress, cross-origin rejection, native proof-of-key binding, signed bearer sessions, replay prevention, and sign-out.
