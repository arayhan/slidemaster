# SlideMaster — Product Spec


## Phase 1a — Design

The product's value is "zero design decisions per deck". That only holds if the one
master template is right, so it gets designed deliberately and signed off before any
pipeline code is written. Owner: `ui-designer`, using the `impeccable` skill.

**Scope**: Art direction for the master slide template and the app chrome. Slide
anatomy for all seven section types (title, profile, intermezzo, quote, references,
contact, closing) — what goes on each, what frontmatter feeds it, what it looks like
when a field is absent. The safe area, the grid, and the type scale at 16:9. Final
token values in `src/styles/tokens.css`. A written Marp theme spec that `1b` implements.
Two visual surfaces are in scope and are kept distinct: the **slide template** (the
product) and the **app chrome** (library, editor preview, present controls).

**Definition of Done**:
- [ ] `docs/DESIGN.md` no longer carries the **Provisional** banner; direction, tokens, type scale, and the seven section-type specs are settled.
- [ ] A static HTML/CSS mockup of the template renders one real past presentation, all seven section types exercised, at 1280×720 — reviewed on a screen, not in a diff.
- [ ] Every token in `src/styles/tokens.css` matches the table in `docs/DESIGN.md`; no value in the mockup comes from outside that table.
- [ ] The theme spec names, for each section type, its frontmatter keys and its absent-field behaviour (per `docs/PRODUCT.md` — the app never invents content).
- [ ] `1a-gate-template` is signed off.

## Phase 1b — Build

**Scope**: TanStack Start app; Marp-core render pipeline (.md + per-slide frontmatter, --- slide splits); the Marp theme CSS implementing the 1a spec; section-type slide shortcuts (title, profile, intermezzo, quote, references, contact, closing); images (jpg/png/gif), fenced code with syntax highlighting, text highlights, logo, react-icons picker; routes /decks (browse by topic), /edit/:id (live preview with file watch), /present/:id (fullscreen, keyboard navigation); SQLite via better-sqlite3 with a metadata index (decks: id, title, topic, path, created_at, updated_at; tags: deck_id, tag) that is rebuildable from the .md files.

**Definition of Done**:
- [ ] A deck `.md` with all seven section types renders through `@marp-team/marp-core` and matches the 1a mockup.
- [ ] `/decks` lists every file in `SLIDEMASTER_DECKS_DIR`, grouped by topic and filterable by tag, from the SQLite index.
- [ ] `/edit/:id` live-reloads the preview within 1s of the `.md` changing on disk.
- [ ] `/present/:id` runs fullscreen and is fully keyboard-operable — arrows, Space, PageUp/PageDown, `f`, `Esc` — with a test covering it.
- [ ] The six index-drift tests in `docs/rules/testing.md` pass, including `db:rebuild` from empty equalling an incremental reconcile.
- [ ] The three import rules in `AGENTS.md` are enforced by ESLint `no-restricted-imports`, and `pnpm lint` is green.
- [ ] `pnpm test` green; `docs/STATE.md` updated.

**The bet** (measured after 1b ships, not a gate on it): within 6-12 months, at least 8 real presentations delivered from slidemaster decks; zero decks where the author fell back to Google Slides or Canva; the master template unchanged after the third deck.

## Phase 2

**Scope**: LaTeX math via KaTeX in decks. PDF export of a deck via Marp. Presenter view — speaker notes rendered from per-slide frontmatter, a dual-screen presenter window, and a talk timer.

**Definition of Done**:
- [ ] A deck with `$...$` / `$$...$$` renders math correctly in preview, present, and PDF.
- [ ] "Export PDF" produces a paginated PDF matching the present view slide-for-slide.
- [ ] Present mode opens a presenter window (notes + next-slide + timer) synced to the audience window.

## Phase 3

**Scope**: Multiple master templates with per-deck selection (frontmatter `template:` key). Layout modes within a template: masonry/grid content slide, and a left-content / right-full-bleed-image split.

**Definition of Done**:
- [ ] A second template exists and a deck renders under either by changing one frontmatter key, with no content edits.
- [ ] The two new layout modes are selectable per slide and documented in `docs/DESIGN.md`.

## Parking lot

Phase 1 explicitly excludes: multiple templates and template switching; PDF or PPTX export; an in-app editor or WYSIWYG (decks are written in the author's own editor, the app only watches files); presenter view, speaker notes, or a timer; LaTeX; charts, graphs, or advanced datatables; micro-animations, micro-interactions, or interactive slides; a masonry/grid layout engine; presenter annotations and key-point callouts; authentication, multi-user, hosting, or sync; an asset-management UI.

**Phase 4 (deferred, not scheduled)**: data visualization — line / doughnut / bar charts, graphs, advanced datatables; micro-animations and micro-interactions; interactive slides; presenter annotations and key-point callouts. Revisit only after Phase 1's success metric is met (8 real decks, zero fallbacks).
