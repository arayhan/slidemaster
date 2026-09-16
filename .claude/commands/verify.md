---
description: Run every check that proves this repo still holds, and report what actually happened
allowed-tools: Bash(pnpm lint), Bash(pnpm typecheck), Bash(pnpm test), Bash(pnpm build), Read, Grep
---

Run the checks below **in order**. Do not stop at the first failure — run all of
them, so one report covers everything rather than one round trip per problem.

1. `pnpm lint` — import-zone violations, all three import rules, plus any
   route-specific package leak.
2. `pnpm typecheck` — type errors across the whole program, including the config files. Lint does not catch these.
3. `pnpm test` — domain and utility regressions.
4. `pnpm build` — `server-only` leaking into a client component, type errors the editor did not surface, per-route size ceilings.

## Report

For each command: the command, whether it passed, and **the decisive line of its
output quoted verbatim**. Not a summary of the output — the line itself. A claim
without output is not a verification, and that is the rule this command exists to
make cheap to follow.

If everything passed, one line each is enough. If something failed, quote the
error and name the file and line, then stop and hand back — do not fix it as part
of running this. Deciding what to do about a failure is a separate call from
discovering it.
