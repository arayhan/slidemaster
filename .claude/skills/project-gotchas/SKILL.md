---
name: project-gotchas
description: Non-negotiable traps for SlideMaster — the invariants and content rules that fail silently. Every agent loads this once per session before touching source.
---

# SlideMaster — non-negotiable traps

The short version of everything here is mirrored in `.claude/hooks/inject-gotchas.ps1`'s `$lines` array, injected at the start of every session — keep the two in sync.

## Phases

Committed: **Phase 0** (walking skeleton + deploy) and **Phase 1** (Marp render
pipeline, the one editorial template, section-type slides, `/decks` `/edit/:id`
`/present/:id`, the derived SQLite index). Deferred, in order: **Phase 2**
(LaTeX, PDF export, presenter view), **Phase 3** (multiple templates, layout
modes), **Phase 4** (data viz, animation, interactive slides — not scheduled).
See `docs/PRD.md`. Do not build Phase 2+ surface while Phase 1 is open.

## This project's most expensive bug

**The SQLite index is a pure derived view of the deck `.md` files, and must stay
that way.** After any reconcile, `decks` / `tags` rows equal the set of deck
files exactly — no orphan rows, no stale `path` / `topic` / `updated_at` — and a
full `pnpm db:rebuild` from empty yields identical rows to an incremental
reconcile. Break this and the library shows renamed/deleted/moved decks with no
error; it surfaces when a talk is opened in front of an audience. No feature may
store deck content that exists nowhere but the database. Full test list in
`docs/rules/testing.md`.

## Content rules

Sourced from `docs/PRODUCT.md` — "What must never be fabricated":

- The app renders slide content, never invents it. No generated headline, bullet,
  quote, citation, statistic, or reference in a rendered deck, present view, or
  export. If the `.md` does not supply it, the slide does without it.
- No `Lorem ipsum` / placeholder copy in rendered output. Placeholder copy is
  allowed only in app chrome and carries a `TODO(content)` marker.
- `profile` / `contact` / `references` slides show only what the frontmatter
  provides — no inferred title, employer, handle, or logo.
- Library metadata (title, topic, tags, dates) comes from frontmatter + the
  filesystem. The app never guesses a topic or backfills a date.

## Placeholder convention

Every stand-in for real content carries a `// TODO(content)` marker (see CLAUDE.md hard rule 2). `rg "TODO\(content\)"` must find the complete set and nothing else.

## Silent traps

- **Marp theme CSS is not in the Tailwind/PostCSS pipeline.** `src/theme/*.css` is
  plain CSS handed to Marp. A Tailwind class or `@apply` written on a slide
  element does nothing and throws no error. Style slides in the theme file only.
- **`better-sqlite3` is a native addon.** After a Node major-version change it
  fails to load with a cryptic ABI error, not a clean message. Fix: `pnpm rebuild
  better-sqlite3`. Pin the Node version in `.nvmrc` / `engines`.
- **The decks dir path must stay server-only.** `SLIDEMASTER_DB_PATH` /
  `SLIDEMASTER_DECKS_DIR` and anything from `src/server/db/` must never be
  imported by a client component or exposed as a `VITE_*` var. `pnpm build`
  catches `server-only` leaks — do not silence it.
- **Stale index if reconcile is skipped.** Any route that lists decks must
  reconcile (or be served from a just-reconciled index), not read whatever rows
  happen to be there. A dev session that edited `.md` files outside the running
  app will show old data until reconcile runs.
- **`html: true` in Marp.** If raw-HTML rendering is enabled for decks, the
  preview/present iframe must stay sandboxed (`sandbox="allow-same-origin"` only,
  no `allow-scripts` for untrusted content). Enabling scripts in the frame to
  "make a demo work" is how the app shell gets broken by pasted markup.
