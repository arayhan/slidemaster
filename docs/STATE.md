# State

<!-- Where we are RIGHT NOW. Overwritten, never appended.
     History and reasoning go to docs/PROGRESS.md — this file is not a log.
     Hard cap 30 lines. Past that, it has become a second log; cut it. -->

**Phase:** 0 — walking skeleton (Phase 1 is split: 1a design, 1b build)
**Next up:** 0-step-03-data-round-trip
**Blocked on:** nothing. 1b is gated behind 1a-gate-template, which is unsigned.
**Last session:** 2026-09-16 — 0-step-02 done: standalone vitest.config.ts, first test, /verify green
**Verify:** passed (4/4 checks) — lint, typecheck, test (8 passed), build

## In flight
<!-- Max one. Empty is normal. -->
- none

## Parked
<!-- Ideas that arrived mid-work. Here, not in the code. -->
- 1a-gate-template is unsigned. Two of its questions cannot be answered honestly yet: the mockup renders specimen content rather than a real past talk, and the specced Archivo woff2 is not in the repo so it renders in the fallback stack.
- Riskiest-assumption test: pour one real past presentation into the mockup's ten frames by hand (~1h). Same hour answers gate question 1.
- 0-step-02 found that 1a-step-02's acceptance criteria 4 and 5 use an unsound regex that matches token names inside CSS comments. The test strips comments; the task file still has the broken version.
- CI runs only build and test — no lint, no typecheck.
