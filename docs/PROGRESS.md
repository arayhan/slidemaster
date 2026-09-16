# SlideMaster — Progress log

Append-only decision and progress log. One line per entry: `[date] [role] [decision/what] [reason]` — roles are `pm`, `lead`, `engineer`, `reviewer`. Newest entries go at the bottom.

<!-- append entries below -->
2026-09-04 pm bootstrap-project run: filled PRODUCT/PRD/DESIGN, all docs/rules, project-gotchas. Key calls — render engine wraps @marp-team/marp-core (no own renderer); SQLite index is a pure derived view of the deck .md files (the expensive-bug invariant); config via optional SLIDEMASTER_DB_PATH / SLIDEMASTER_DECKS_DIR; starter tokens ink-black + cobalt #1B4DFF + serif headline (impeccable to refine); no formal a11y target, present-mode keyboard nav is a tested functional requirement. Reason: lock judgment content before Phase 1 build.
2026-09-16 pm Phase 1 split into 1a (design) / 1b (build); added docs/tasks/1a-gate-template.md; rewrote PRD Phase 1 DoD into runnable 1a and 1b checks and demoted the 8-decks metric to "The bet". Reason: the one master template is the whole value proposition ("zero design decisions per deck") but was scheduled as an implementation bullet next to installing better-sqlite3, and Phase 1's only DoD checkbox was a 6-12 month outcome that cannot gate a ship.
