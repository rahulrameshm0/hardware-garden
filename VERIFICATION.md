# Verification

Checked on 23 October 2026.

## Automated checks

- TypeScript type checking: passed.
- Production build using the Sites helper: passed.
- Six curriculum, merge-rule, and SQLite database tests: passed.
- Local API checks: anonymous requests denied; sign-in works; authenticated reads are uncached; mismatched account requests rejected; cross-origin writes rejected; unknown lessons and invalid scores rejected; repeated sync accepted.
- Curriculum validation covers 32 unique lessons, four per module, three questions and activities per lesson, definitions for every tagged term, and valid animation/model references.

## Browser checks

- Local development sign-in and server-backed progress synchronization.
- First lesson: simple explanation, animation stepping/speed control, model exploration, exploded and 2D views, activity checkboxes, three-question grading and explanations, completion, bookmark, and dashboard completion count.
- All eight models render at a 390-pixel phone layout.
- Logic playground: AND with both inputs true returns 1; NOT of true returns 0.
- Desktop dashboard reviewed at a 1440-pixel layout; phone lab reviewed at 390 pixels.
- Production build loaded online, then its server was stopped. Reloading the lesson still showed the full content and working animation controls through the cached app shell.

## Practical limits

Browser dimensions simulate devices; no physical Android/iPhone installation or real second-device session was available. Hosted account sign-in uses Better Auth and D1. Course duration is an estimate including exploration, activities, and quizzes. Models are procedural Three.js educational illustrations with a CSS diagram fallback. Captions are text-based interactive animations, not narrated recordings.

## Realistic hardware and native update

- Three.js viewer and dark theme reviewed in the local browser; full RGB memory modules fit inside the scene.
- TypeScript, existing course/database tests, and the original local API checks pass after the update.
- Real local username account creation and login pass, including rejected wrong passwords, saved progress, cross-origin protection, PKCE-bound mobile exchange, signed bearer session verification, replay prevention, and logout.
- Android and iOS native projects were generated and synchronized. The mobile web bundle builds successfully.
- Google OAuth branding and Web client creation succeeded; credentials are stored in Sites. Apple developer credentials were unavailable.
- The owner approved replacing the ChatGPT-only gate with app sign-in. Live API checks pass: password login is enabled, anonymous progress requests are denied, and native CORS is available.
- Local native compilation is unavailable because this host has neither a full Xcode installation nor JDK/Android SDK. The iOS simulator build succeeded in GitHub Actions (run 39919356274). Android initially failed because the setup action requested a removed SDK tools package; the corrected workflow succeeded in run 39919813839. Both artifacts were downloaded to ignored outputs directories. The owner confirmed no Apple Developer membership is available, so Apple sign-in and device-signed iPhone distribution remain blocked by that requirement.

## Gemini learning helper

- Lesson-aware question input, course fallback, animated labeled storyboard, captions, voice selection, playback speed, and reduced-motion support implemented.
- Gemini API key created in the dedicated Hardware Garden project and stored only in Sites secrets. No paid billing enabled.
- Authenticated text and speech endpoints enforce origin checks, input limits, persistent atomic per-account quotas, and server-side credentials.
- External Gemini requests from this local host did not complete; hosted AI and voice require production verification. Device speech and built-in explanations provide fallbacks.
