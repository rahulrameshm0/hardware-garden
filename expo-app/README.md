# Hardware Garden 3.0.1 — Expo native app

A React Native app for Android and iOS, separate from the Capacitor/web client. Native screens provide the course, section video links, quizzes, bookmarks, glossary, progress, AI helper, settings and audio playback. The 3D lab alone uses the existing online WebGL viewer inside a native modal.

## Open on a phone

Project: https://expo.dev/accounts/rahulrameshm0/projects/hardware-garden

Preview for Android/iPhone: https://expo.dev/accounts/rahulrameshm0/projects/hardware-garden/updates

Install the current Expo Go (SDK 58) and sign into the Expo account `rahulrameshm0`, then open this project's preview QR from the update page. Expo Go restricts EAS updates to projects owned by the signed-in account or its organizations. This is a native preview inside Expo Go, not an App Store release.

Android standalone installer: https://expo.dev/accounts/rahulrameshm0/projects/hardware-garden/builds

A standalone iPhone/TestFlight release needs the owner's Apple Developer team and signing credentials. No Apple membership or paid billing was purchased. The `simulator` build profile targets iOS Simulator; it cannot install on a physical iPhone.

## Accounts and offline use

Uses the same authenticated API/database as the website. Password sign-in and registration use native HTTPS requests and signed bearer sessions in SecureStore. Google uses the existing one-time-token/PKCE exchange. Installed builds use the separate `hardwaregardenexpo://auth` scheme so an older Capacitor installation cannot intercept their callback. Expo Go has a project-specific return URI and a one-minute sign-in-code fallback; proof stays in SecureStore. No authentication tokens or provider keys are bundled.

Progress caches are account-scoped in AsyncStorage. The server keeps earned completion, best score, latest bookmark change, and latest position. Guest progress stays separate from account progress. Failed saves stay locally and retry on foreground, later changes, or Settings → Sync progress. Lessons, quiz content, text diagrams and glossary are bundled. YouTube, live 3D and Gemini require internet.

Natural voice uses Gemini audio through the authenticated API and native `expo-audio`, with iPhone silent-mode playback enabled. Device speech is a separate explicit option. Device speech may need silent mode off on an iPhone. No microphone permission is requested. The UI shows load, stop and error states. Voice cleanup invalidates late requests and guards released players.

## Development

From repository root, `node scripts/sync-expo-content.mjs` synchronizes the shared content snapshots. `npm test` checks snapshot equality and native return-code validation.

Inside `expo-app/`:

- `npm ci`
- `npm run typecheck`
- `npx expo install --check`
- `npm start`
- `npm run export`
- `eas build --profile preview --platform android`
- `eas update --branch preview --platform all --environment preview --message 'Description'`

## Verification limits

Expo Doctor passes 20/20 checks. Android/iOS production bundles export, Expo package compatibility, TypeScript and root content/auth tests pass. The React Native web preview was used to check 390px layout, section navigation, quiz explanations and completion persistence. The separate website narration was checked with a visible playing audio element. These checks do not establish physical-device audio, SecureStore, Google browser return, native video links or WebView behavior. Test those on the target phones before store publication.
