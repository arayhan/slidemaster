# State

<!-- Where we are RIGHT NOW. Overwritten, never appended.
     History and reasoning go to docs/PROGRESS.md — this file is not a log.
     Hard cap 30 lines. Past that, it has become a second log; cut it. -->

**Phase:** 1a — design. Phase 0 closed 2026-09-17.
**Next up:** 1a-gate-template — evidence gathered, two items still open before it can be signed
**Blocked on:** 1a-gate-template needs the Archivo woff2 in the repo and one real past talk poured into the mockup. 1b's render pipeline waits on it; the SQLite index is not gated and is built.
**Last session:** 2026-09-17 — Phase 0 signed off; mockup rendered for the first time and three capacity numbers corrected against measurement
**Verify:** passed (4/4 checks) — lint, typecheck, test (33 passed), build

## In flight
<!-- Max one. Empty is normal. -->
- none

## Parked
<!-- Ideas that arrived mid-work. Here, not in the code. -->
- 1a-gate-template is unsigned. Two blockers remain: the mockup still renders specimen content rather than a real past talk, and the specced Archivo woff2 is absent so all ten frames are the fallback stack.
- CI does not trigger on push — cause unknown, outside the repo. Manual dispatch works. Until fixed, a red commit can land on main unnoticed.
- Riskiest-assumption test: pour one real past presentation into the mockup's ten frames by hand (~1h). Same hour answers gate question 1.
