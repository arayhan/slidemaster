# 0-step-02-verify-loop

Establish a genuine automated verification loop with real test assertions.

> **Status: done.** `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`
> all pass. Read *What the first test asserts, and what it does not* before
> writing the next one — this step made a deliberate compromise and the next step
> is where it gets paid back.

## Goal

Ensure the project has a working test suite with at least one substantive
automated test asserting real behavior, and that the verification command passes
completely.

## Deliverables

- At least one passing automated test asserting real application behavior
- `/verify` (or `.claude/commands/verify.md`) runs all checks green

## What was actually blocking this

Two independent failures, not one:

1. **The test runner could not start.** `vite.config.ts` had no `test` block and
   no `vitest.config.*` existed, so vitest loaded the app config wholesale and
   mounted `nitro()`, `tanstackStart()`, and `viteReact()`. Their SSR machinery
   reaches vite's module-runner inlining and throws `ReferenceError: module is
   not defined`, then hangs teardown for 10s. This fired regardless of whether
   any test file existed, so "no tests" was the symptom, not the cause.
2. **No test file existed.** The repo's only test went out with the demo modules
   in `ee4e558`.

Fixed by a standalone `vitest.config.ts` that never loads the app's plugin chain.
`tsconfig.json`'s `include` gained `vitest.config.ts`, or `pnpm typecheck` would
not have covered it.

## What the first test asserts, and what it does not

`0-step-02` asks for a test of "real application behavior". **There is none yet.**
`src/domain/`, `src/lib/`, `src/utils/`, and `src/services/` are empty; the only
exported behaviour in `src/` is `getRouter()` and two route objects.
`docs/rules/testing.md` rules out testing those: "Rendering that only proves React
renders. Getters. Types the compiler already checks."

The real logic — frontmatter parsing, the title-length tier, the reconcile
invariant — is Phase 1b, gated behind `1a-gate-template`. Writing it here would
walk through that gate.

So the first test guards **design-system integrity** instead, in
`src/theme/slide-tokens.test.ts`:

| Case | Assertion |
|---|---|
| Token parity | Every `--slide-*` name and value in the mockup's `TOKENS:START`/`TOKENS:END` block matches `src/theme/slide-tokens.css`, both directions |
| No raw colour | No `#rrggbb` after `TOKENS:END` |
| No raw length | No bare `NNpx` after `TOKENS:END` |
| Spec completeness | `docs/DESIGN.md` has 7 section headings, 7 key tables, 7 absent-field lists, 1 default content slide |

**Why this is worth a test rather than a one-off script.**
`src/theme/slide-tokens.css` and the mockup's token block are two copies of the
same data. The mockup is what a human signs the `1a` gate from; the CSS is what
1b builds against. Tune one and not the other and nothing errors — the gate
approves a mockup that no longer describes what gets built, and it surfaces weeks
later as "the slides don't look like the mockup".

**This is a stated compromise, not a claim that the requirement was met.** The
first test of real application behavior lands in `0-step-03` or Phase 1b,
whichever comes first.

## A bug this found in 1a-step-02's own acceptance criteria

Acceptance criteria 4 and 5 in `docs/tasks/1a-step-02-template-spec.md` match
`/(--slide-[a-z0-9-]+)\s*:\s*([^;]+);/g` over the raw file text. That is unsound.
`src/theme/slide-tokens.css:69` explains one token by naming another inside a
comment — "Not the same value as `--slide-on-paper-accent`: cobalt on near-black
is 3.1:1" — so the pattern matches inside the comment and its `[^;]+` runs past
the comment terminator, consuming the real `--slide-on-ink-accent` declaration
that follows.

Both files still counted 74 tokens, which is why a count-based check called them
identical. They were not being compared correctly. The test strips comments
before extracting; the criteria in `1a-step-02` are still written the unsound way
and would report a false difference if anyone ran them.

## Acceptance Criteria

```bash
pnpm lint         # ESLint: No issues found
pnpm typecheck    # clean
pnpm test         # Tests  8 passed (8)
pnpm build        # ✓ built, .output/ generated
```

The test was also proven able to fail, which is the part that makes the rest
meaningful:

```bash
# introduce drift in one file only
sed -i 's/--slide-canvas-w: 1280px/--slide-canvas-w: 1281px/' src/theme/slide-tokens.css
pnpm test   # Tests  2 failed | 6 passed (8) — names --slide-canvas-w in both directions
git checkout src/theme/slide-tokens.css
pnpm test   # Tests  8 passed (8)
```

## Findings handed on, not fixed here

- `.github/workflows/ci.yml` runs only `pnpm build` and `pnpm test`. No lint, no
  typecheck — CI is weaker than `/verify`.
- `docs/architecture.md:213-215` — Styling, Data fetching, and Validation are
  still `<X>` with no `TODO(content)` marker, which `AGENTS.md` hard rule 2
  forbids. Only the Tests row was this step's to answer.
- `.claude/hooks/check-agentsmd.ps1` does not watch `docs/rules/*` or
  `docs/tasks/*`, though both can invalidate `AGENTS.md`.
- `src/routeTree.gen.ts` is `@ts-nocheck`ed and contains stray brace blocks.
  Regenerate with `pnpm generate-routes` when routes are next added.

**Depends:** 0-step-01-scaffold · **Blocks:** 0-step-03-data-round-trip, 0-gate-deploy · **handoff:** software-engineer
