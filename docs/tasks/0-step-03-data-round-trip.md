# 0-step-03-data-round-trip

Connect the stack end-to-end with a minimal data round-trip.

> **Status: done.** `/verify` green. The deck library at `/` is read from SQLite,
> reconciled from `decks/*.md` on every load. Read *The step as written did not
> fit* before reusing its shape for anything.

## Goal

Verify that data can be written and persisted such that refreshing the page
retrieves the saved record.

## The step as written did not fit

The original deliverables asked for "a minimal form or mutation path that writes a
single record" and "write one record through the UI/form". That is generator
boilerplate assuming a CRUD app. **SlideMaster has no user-facing write path.**

- `docs/PRODUCT.md`: deck metadata "comes from the `.md` frontmatter and the
  filesystem. The app does not guess a topic or backfill a date."
- `docs/rules/principles.md` #2: "The SQLite index is a derived cache… no feature
  may store deck content that exists nowhere else."

A form writing a deck row would install the exact confusion behind this project's
named expensive bug — two sources of truth for deck metadata.

So the round-trip walks the product's real data path instead. The write still
happens; it happens where this product's writes actually happen, on disk:

```
decks/*.md ──parse──▶ reconcile() ──▶ SQLite ──▶ server fn ──▶ loader ──▶ /
```

## Delivered

| Area | Files |
|---|---|
| Dependency + toolchain | `pnpm-workspace.yaml`, `package.json` (`engines`), `.nvmrc`, `.github/workflows/ci.yml` |
| Migration runner | `scripts/db-migrate.mjs`, `db:migrate` / `db:rebuild` |
| Schema | `db/migrations/001_decks.sql` |
| Frontmatter contract | `docs/DESIGN.md` § Deck-level frontmatter |
| Domain | `src/domain/deck.ts` |
| Data layer | `src/server/db/{connection,queries,reconcile}.ts` |
| Server function | `src/server/decks.ts` |
| Surface | `src/routes/index.tsx` |
| Fixture | `decks/README.md` |
| Tests | `src/domain/deck.test.ts`, `src/server/db/reconcile.test.ts` |

These are the **first tests of real application behaviour** — `0-step-02`
explicitly deferred them here.

## Three things that were silently broken

**pnpm would not have built the native addon.** `pnpm-workspace.yaml` allowlisted
only `esbuild`, and pnpm 10+ blocks dependency lifecycle scripts. `better-sqlite3`
would have installed with no prebuild download and no gyp build, then failed at
runtime with nothing said at install time. It is the first package in this tree to
need an install script at all.

**The Node ABI trap was live.** Local ran Node 24, CI pinned 22 — different
`NODE_MODULE_VERSION`. CI also ran pnpm 9 against local pnpm 11, and pnpm 9
predates `allowBuilds` entirely, so the two would not have agreed on whether to
build the addon. `project-gotchas` names this as silent trap 2 and says to pin
`.nvmrc` / `engines`; neither existed.

**`server-only` was never installed.** `AGENTS.md` mandated `import "server-only"`
in every `src/server/` file. The package is not in `package.json`, the lockfile,
or `node_modules` — the import would have failed module resolution, not produced
the intended client-boundary error. The marker that works here is
`@tanstack/react-start/server-only`.

## What the build taught

`src/server/decks.ts` first carried the server-only marker and the build refused
it by name. The plugin was right: a server function exists to be *called* from the
client, the route imports the module so the handler body can be stripped, and
claiming the file is server-only contradicts that. **The boundary is
`src/server/db/`, not `src/server/` wholesale.**

Separately, the planned risk did not materialise. Nitro traces and copies the
native addon rather than bundling it —
`.output/server/node_modules/better-sqlite3/build/Release/better_sqlite3.node` is
present and no `traceDeps` config was needed.

## Acceptance Criteria

```bash
pnpm lint         # ESLint: No issues found
pnpm typecheck    # clean
pnpm test         # Tests  33 passed (33)
pnpm build        # ✓ built, .output/ generated
pnpm db:migrate   # applied 001_decks.sql
```

The round-trip, run against the **built** server (`node .output/server/index.mjs`),
not the dev server:

| Step | Expected | Observed |
|---|---|---|
| Baseline | fixture deck under its topic | `slidemaster</h2>`, `README.md`, `getting-started, meta` |
| Edit `topic:` → `docs` | grouping moves | `docs</h2>` |
| Add a deck with no `topic` | skipped, named | `draft.md — missing required key: topic` |
| Delete every deck | empty state | `No decks indexed` |
| Restore | back as before | `slidemaster</h2>` |

The invariant is a test, not a claim. Proven able to fail: disabling orphan
deletion in `reconcile` turns exactly four red — delete, rename-changes-id,
rebuild-equals-incremental, and the property test over forty random operations.

## Findings handed on

- **`0-gate-deploy` contradicts the product.** It asks whether the skeleton is "deployed
  to a live, publicly reachable production URL" and whether "production environment
  variables and secrets" are configured. `AGENTS.md`: "Not a commercial product: no
  accounts, no hosting, no multi-user." The gate is unedited generator boilerplate and
  cannot be signed honestly as written. It needs rewriting or retiring before Phase 0 closes.
- **`docs/rules/security.md` does not exist**, and is linked from `AGENTS.md` hard rule 1
  and `docs/rules/sql-and-data.md`.
- **`src/styles/tokens.css` is imported by nothing** — the `--chrome-*` tokens are not
  loaded at runtime. Only `src/styles.css` reaches the browser.
- **CI runs neither lint nor typecheck.**
- **Correction to `0-step-02`'s record:** it says `src/routeTree.gen.ts` "contains stray
  brace blocks". It does not — braces balance, and the unused `createStart` type import is
  deliberate generator output.

**Depends:** 0-step-02-verify-loop · **Blocks:** 0-gate-deploy · **handoff:** project-manager
