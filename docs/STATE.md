# State

<!-- Where we are RIGHT NOW. Overwritten, never appended.
     History and reasoning go to docs/PROGRESS.md — this file is not a log.
     Hard cap 30 lines. Past that, it has become a second log; cut it. -->

**Phase:** 0 — walking skeleton (Phase 1 is split: 1a design, 1b build)
**Next up:** 0-gate-deploy — but see Blocked on; it cannot be signed as written
**Blocked on:** nothing technical. 1b's render pipeline is gated behind 1a-gate-template, which is unsigned; the SQLite index is explicitly not gated.
**Last session:** 2026-09-17 — 0-step-03 done: decks index end to end, .md → reconcile → SQLite → loader → /
**Verify:** passed (4/4 checks) — lint, typecheck, test (33 passed), build

## In flight
<!-- Max one. Empty is normal. -->
- none

## Parked
<!-- Ideas that arrived mid-work. Here, not in the code. -->
- 0-gate-deploy is unedited generator boilerplate. It asks for a "publicly reachable production URL" and "production secrets"; AGENTS.md says no hosting, no accounts, no multi-user. Rewrite or retire it before Phase 0 closes.
- 1a-gate-template is unsigned. Two questions cannot be answered honestly yet: the mockup renders specimen content rather than a real past talk, and the specced Archivo woff2 is absent so it renders in the fallback stack.
- Riskiest-assumption test: pour one real past presentation into the mockup's ten frames by hand (~1h). Same hour answers gate question 1.
