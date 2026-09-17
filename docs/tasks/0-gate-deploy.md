# 0-gate-deploy

Walking-skeleton verification gate. Closes Phase 0.

> **Rewritten 2026-09-17.** The generated version asked whether the skeleton was
> "deployed to a live, publicly reachable production URL", whether the round-trip
> succeeded "against production infrastructure", and whether "production
> environment variables and secrets" were configured.
>
> None of those questions can be answered for this product. `AGENTS.md`: "Not a
> commercial product: no accounts, no hosting, no multi-user." There is no
> production, no URL, and no secret — `SLIDEMASTER_DB_PATH` and
> `SLIDEMASTER_DECKS_DIR` are filesystem paths with working defaults.
>
> A gate that cannot be signed honestly gets signed dishonestly or skipped
> silently, and both are worse than rewriting it. The questions below ask what the
> deploy questions were *for*: does the whole stack actually work outside the
> development server, on a machine that was not the one that built it.

## Decision Maker

Human owner — the only user of this tool.

## Unblocks

Phase 1a's gate and, through it, Phase 1b.

## Questions

1. **Does the production build run?** Not "does `pnpm build` exit 0" — does
   `node .output/server/index.mjs` serve the deck library, with the native SQLite
   addon loading from the traced output rather than from `node_modules/`?
2. **Does the round-trip survive a restart?** Edit a deck's frontmatter, restart
   the server, and confirm the change is there — proving the index is on disk and
   not in process memory.
3. **Does it work from a clean checkout?** `git clone`, `pnpm install`,
   `pnpm db:migrate`, `pnpm dev`. This is the question the original gate was
   really asking: does anything work only because this machine happens to be set
   up a particular way?
4. **Are the environment variables genuinely optional?** The app must run with no
   `.env` at all. If it does not, the defaults in `.env.example` are a lie.
5. **Does CI pass on a pushed commit?** CI now runs the same four checks as
   `/verify`. A green local loop and a red CI is a loop that is not telling the
   truth.
6. **Is there anything in the skeleton that only works because an agent ran it
   interactively** — a step that is in a transcript rather than in `package.json`
   or a task file?

## Evidence on hand

| Question | Status |
|---|---|
| 1 | **Verified.** `node .output/server/index.mjs` served `/` with the deck library; `.output/server/node_modules/better-sqlite3/build/Release/better_sqlite3.node` present |
| 2 | **Verified.** Frontmatter edits, additions, deletions and restores all reflected against the built server |
| 3 | **Verified, and it found a real defect.** `git clone` + `pnpm install --frozen-lockfile` + `pnpm db:migrate` + all four checks. `pnpm typecheck` failed on the fresh clone while passing locally — `src/routeTree.gen.ts` is generated and gitignored, so it exists only on a machine that has built. Fixed by `tsr generate && tsc --noEmit`. The native addon built at `node_modules/better-sqlite3/build/Release/better_sqlite3.node` |
| 4 | **Verified.** No `.env` exists in the repo and never has; the app runs on the defaults |
| 5 | **Verified.** [Run 35174301117](https://github.com/arayhan/slidemaster/actions/runs/35174301117) on `cf4199d` — lint, typecheck, test, build all green on ubuntu-latest, Node 24, pnpm 11. Second confirmation of question 3 on a different OS |
| 6 | **Believed clean**, not proven — `db:migrate` is the risk, since it is run manually and nothing enforces it |

**One finding the owner should know before signing.** GitHub scheduled **no runs
at all** from `push` despite the workflow being registered, active, and on the
default branch, with Actions enabled and `allowed_actions: all` —
`total_count` was 0 across every push. Adding `workflow_dispatch` and triggering
by hand produced an immediate green run, so the workflow is sound and the trigger
is not firing. Cause not established; it is outside the repo. **Until that is
resolved, CI is manual, and a red commit can land on `main` unnoticed.**

## Sign-off

- [ ] Production build runs and serves the library: `____________________`
- [ ] Round-trip survives a restart
- [ ] Clean-checkout install verified on: `____________________` (date)
- [ ] Runs with no `.env`
- [ ] CI green on a pushed commit: `____________________` (run URL or SHA)
- [ ] Approved to close Phase 0 by: `____________________` (Date: `__________`)

Outcome / conditions attached to the approval:

```
____________________________________________________________
____________________________________________________________
```

**Blocks:** 1a-gate-template, Phase 1b
