# SlideMaster — Product Spec


## Phase 1

**Scope**: Phase 1: TanStack Start app; Marp-core render pipeline (.md + per-slide frontmatter, --- slide splits); the single editorial master template as a Marp theme plus tokens.css; section-type slide shortcuts (title, profile, intermezzo, quote, references, contact, closing); images (jpg/png/gif), fenced code with syntax highlighting, text highlights, logo, react-icons picker; routes /decks (browse by topic), /edit/:id (live preview with file watch), /present/:id (fullscreen, keyboard navigation); SQLite via better-sqlite3 with a metadata index (decks: id, title, topic, path, created_at, updated_at; tags: deck_id, tag) that is rebuildable from the .md files. Phase 2: LaTeX via KaTeX, PDF export via Marp, presenter view with speaker notes and a timer. Phase 3: multiple templates with per-deck switching; layout modes (masonry/grid, left-content with right full-bleed image). Phase 4: data visualization (line/doughnut/bar charts, graphs, advanced datatables), micro-animations and micro-interactions, interactive slides, presenter annotations and key-point callouts.

**Definition of Done**:
- [ ] Within 6-12 months: at least 8 real presentations delivered from slidemaster decks; zero decks where the author fell back to Google Slides or Canva; the master template unchanged after the third deck.

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
