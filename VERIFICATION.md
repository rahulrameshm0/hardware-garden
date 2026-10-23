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

Browser dimensions simulate devices; no physical Android/iPhone installation or real second-device session was available. Hosted sign-in is provided by Sites and remains distinct from local mock sign-in. Course duration is an estimate including exploration, activities, and quizzes. Models are procedural CSS 3D educational illustrations. Captions are text-based interactive animations, not narrated recordings.
