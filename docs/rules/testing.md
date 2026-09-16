# Testing

```bash
pnpm test
```

## What must have a test

- **Every non-trivial module under `src/domain/`, `src/lib/`, and
  `src/utils/`.** These are the layers everything else imports; a regression
  here surfaces as a bug three folders away.
- **Every branch that encodes a business rule.** If an `if` decides what the user
  is allowed to do, both sides of it get a case.
- **Every bug you fix.** The test that would have caught it goes in first, and you
  watch it fail before you fix anything. A fix with no failing test first is a fix
  you have not proven.

## What does not

Rendering that only proves React renders. Getters. Types the compiler already
checks. A test whose only assertion is that the code ran is a maintenance cost
with no signal.

## Where tests live

Colocated with what they test, one dot-suffix along the same convention as the
rest of the module: `order-total.ts` is tested by `order-total.test.ts` in the
same folder. No parallel `__tests__/` tree — a test that lives elsewhere is a test
that gets orphaned when the file it covers is renamed.

## What to mock

**The boundary, never the module under test.** Mock the network, the clock, the
filesystem, the third-party SDK. Do not mock the function you are testing, and do
not mock a module you own just to avoid setting up its input — if the setup is
painful, that is the design telling you something.

A test that mocks everything it touches asserts that your mocks agree with each
other, which they always will.

## Unit versus integration

| | Covers | Mocks |
|---|---|---|
| Unit | One pure function or one module's logic | The boundary only |
| Integration | A path through several layers | The outermost boundary only (the network) |

Most value lives in unit tests of `src/domain/` plus a thin layer of
integration tests over the paths a user actually takes. Reach for an integration
test when the bug you are preventing lives *between* two layers rather than inside
one.

## Verification

The commands that prove the architecture still holds, and what each catches:

| Command | Catches |
|---|---|
| `pnpm lint` | Import-zone violations — all rules, plus route-specific package leaks |
| `pnpm typecheck` | Type errors across the whole program, config files included |
| `pnpm test` | Domain and utility regressions |
| `pnpm build` | `server-only` leaks into client components; per-route size ceilings |

**Run them and quote the decisive line. A claim without output is not a
verification.** `/verify` in `.claude/commands/` runs all
four and reports what it saw.

## The expensive bug

**The SQLite index drifts from the `.md` files and the library shows a lie** —
a deck that was renamed, moved, or deleted on disk still appears; its topic is
stale; `/present/:id` opens a dead path. Because nothing errors, it is found only
when a talk is opened in front of an audience.

**Invariant**: the `decks` / `tags` tables are a pure derived view of the files
under `SLIDEMASTER_DECKS_DIR`. After any `reconcile`, the set of `decks` rows
equals the set of deck `.md` files exactly — no orphan rows, no stale `path`,
`topic`, or `updated_at` — and `pnpm db:rebuild` from an empty database produces
byte-identical rows to an incremental reconcile over the same tree.

**Tests that make it impossible** (integration, over a temp decks dir + temp DB):

- Add a `.md` file → reconcile → row exists with the right `topic` and `tags`.
- Rename / move a file → reconcile → exactly one row, `path` updated, same `id`
  if the frontmatter `id` is unchanged.
- Delete a file → reconcile → row and its `tags` gone.
- Edit frontmatter (`topic`, `tags`, `title`) → reconcile → row reflects it.
- `db:rebuild` and incremental reconcile over the same tree yield identical rows.
- Property test: apply a random sequence of add/rename/edit/delete ops, reconcile
  after each, assert `rows == filesystem` every time.
