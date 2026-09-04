# SlideMaster — Product Spec

**Pre-filled from the raygent guided interview** (docs/interview.json). Run /bootstrap-project to deepen any remaining <TODO(content)> sections.

## Phase 1

**Scope**: Phase 1: TanStack Start app; Marp-core render pipeline (.md + per-slide frontmatter, --- slide splits); the single editorial master template as a Marp theme plus tokens.css; section-type slide shortcuts (title, profile, intermezzo, quote, references, contact, closing); images (jpg/png/gif), fenced code with syntax highlighting, text highlights, logo, react-icons picker; routes /decks (browse by topic), /edit/:id (live preview with file watch), /present/:id (fullscreen, keyboard navigation); SQLite via better-sqlite3 with a metadata index (decks: id, title, topic, path, created_at, updated_at; tags: deck_id, tag) that is rebuildable from the .md files. Phase 2: LaTeX via KaTeX, PDF export via Marp, presenter view with speaker notes and a timer. Phase 3: multiple templates with per-deck switching; layout modes (masonry/grid, left-content with right full-bleed image). Phase 4: data visualization (line/doughnut/bar charts, graphs, advanced datatables), micro-animations and micro-interactions, interactive slides, presenter annotations and key-point callouts.

**Definition of Done**:
- [ ] Within 6-12 months: at least 8 real presentations delivered from slidemaster decks; zero decks where the author fell back to Google Slides or Canva; the master template unchanged after the third deck.

## Phase 2

**Scope**: <TODO(content)>

## Phase 3

**Scope**: <TODO(content)>

## Parking lot

Phase 1 explicitly excludes: multiple templates and template switching; PDF or PPTX export; an in-app editor or WYSIWYG (decks are written in the author's own editor, the app only watches files); presenter view, speaker notes, or a timer; LaTeX; charts, graphs, or advanced datatables; micro-animations, micro-interactions, or interactive slides; a masonry/grid layout engine; presenter annotations and key-point callouts; authentication, multi-user, hosting, or sync; an asset-management UI.
