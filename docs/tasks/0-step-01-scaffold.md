# 0-step-01-scaffold

Get the base application running locally with clean linting and typechecking.

> **Status: done.** Satisfied incrementally across `0-step-02` and `0-step-03`
> rather than as a discrete step, and never formally recorded until now.

## Goal

Verify that the scaffolded application boots locally, serves its initial routes
without errors, and passes all basic static checks.

## Deliverables

- Local development server running cleanly
- Static lint and typecheck passing with zero errors

## Acceptance Criteria

```bash
pnpm dev        # serves / with the deck library rendered
pnpm lint       # ESLint: No issues found
pnpm typecheck  # clean
```

All three verified 2026-09-17. `pnpm dev` returns the deck library at
`http://localhost:3000/` — `slidemaster</h2>`, `How SlideMaster decks work`.
`node .output/server/index.mjs` was also exercised in `0-step-03`, which is the
stronger check: the production build serves the same page with the native SQLite
addon loaded from `.output/server/node_modules/`.

**The `pnpm typecheck` script did not exist when this step was written.** It was
added in `0-step-02` and immediately found six real errors — dangling imports and
dead route links left by the demo-module removal. Until then this step's own
acceptance criteria could not be run.

**Depends:** — · **Blocks:** 0-step-02-verify-loop · **handoff:** software-engineer
