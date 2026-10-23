# Android and iPhone apps

Both native projects are generated from the same React learning app. The 32 lessons, animations, and procedural 3D geometry are bundled with the application, so reviewing lessons and models does not require downloading a remote website.

## Build

```sh
npm ci
npm run mobile:sync
npm run mobile:android
npm run mobile:ios
```

Android requires JDK 21 and the Android SDK. The debug APK is generated with `cd android && ./gradlew assembleDebug`. iPhone development requires a full Xcode installation. Open the Xcode project, select your development team, and use a device or simulator. App Store/TestFlight distribution requires the owner's Apple Developer membership and signing configuration; no signing identities or passwords belong in Git.

The GitHub workflow **Build mobile apps** builds an Android debug APK and an unsigned iOS simulator app. Artifacts are attached to the workflow run. A simulator build is not an installable iPhone IPA.

## Backend

The native build uses `HG_API_BASE_URL`, defaulting to the existing Hardware Garden website. Override it during `npm run mobile:build` if moving to another backend. Cross-origin access is restricted to the native localhost origins. Personal records always require a server-verified session and matching account ID.

The owner approved replacing the platform ChatGPT-only gate with application sign-in. The site is reachable without ChatGPT; account sessions protect all personal progress. Production checks confirm anonymous progress requests return 401 and native API origins receive the expected CORS headers.

## Native sign-in

Username/password sign-in uses the app API directly. Google and Apple use the system browser, not an embedded webview. The app creates a verifier and state, sends only a SHA-256 challenge to the browser, then receives a one-minute, single-use exchange code through `hardwaregarden://auth`. The server checks the verifier before consuming the code. Session tokens are stored in Android encrypted storage or iOS Keychain through the secure storage plugin; ordinary preferences hold only course progress and UI preferences.

Both native projects register the callback URL. iOS includes the preferences privacy manifest. No camera, microphone, contacts, or location permissions are requested.
