# State

<!-- Where we are RIGHT NOW. Overwritten, never appended.
     History and reasoning go to docs/PROGRESS.md — this file is not a log.
     Hard cap 30 lines. Past that, it has become a second log; cut it. -->

**Phase:** 0 — walking skeleton (Phase 1 is now split: 1a design, 1b build)
**Next up:** 0-step-01-scaffold
**Blocked on:** nothing
**Last session:** 2026-09-16 — split Phase 1 into 1a (design) / 1b (build); dispatched ui-designer for art direction
**Verify:** pnpm lint clean, pnpm typecheck clean, pnpm test FAILS — no test files exist (the only one shipped with the deleted demo). 0-step-02 must write the first real test.

## In flight
<!-- Max one. Empty is normal. -->
- 1a design pass — ui-designer establishing template art direction and the seven section-type specs

## Parked
<!-- Ideas that arrived mid-work. Here, not in the code. -->
- Riskiest-assumption test: rebuild the last real presentation in Marp by hand (~1h) before trusting the pipeline
- Working tree carries 30 uncommitted deletions of the generated demo modules (order/transaction) — commit before starting 0-step-01
