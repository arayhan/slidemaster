# SlideMaster — Design System


## Direction

Minimal and editorial. Generous whitespace, one strong typeface (a grotesk or serif headline), mostly black and white with a single accent color, no chrome and no gradients. Content first, high legibility, large type. Design tokens live in tokens.css; the impeccable skill refines the look later.

This file is the design system itself — what the tokens are, what the type scale is, what the components look like. **How to write the styles that implement it** is a separate file: [`docs/rules/ui-styling.md`](rules/ui-styling.md).

Use the `impeccable` skill (`/impeccable`) for taste and direction when establishing or evolving this system — it covers hierarchy, typography, motion, and avoiding generic/templated interface design.

> **Provisional.** These are real, working values so the scaffold has something concrete — not a finished system. Run `/impeccable` to refine direction, contrast, and type before Phase 1 UI is considered done. The slide template's own look (the Marp theme) is a separate, larger design pass; this section covers the **app chrome** (library, editor preview frame, present controls).

## Tokens

Defined as CSS custom properties in `src/styles/tokens.css`, imported once at the app root.

| Token | Value | Use |
|---|---|---|
| `--color-fg` | `#111111` | primary text |
| `--color-fg-muted` | `#5A5A5A` | secondary text, metadata |
| `--color-bg` | `#FAFAFA` | app background |
| `--color-surface` | `#FFFFFF` | cards, panels |
| `--color-border` | `#E4E4E4` | hairlines, dividers |
| `--color-accent` | `#1B4DFF` | links, focus ring, active state |
| `--color-accent-fg` | `#FFFFFF` | text on accent |
| `--space-1 … --space-5` | `8px 16px 24px 40px 64px` | the only spacing steps — no in-between values |
| `--radius` | `0` | no rounded corners |
| `--shadow` | `none` | flat; separate with borders, not elevation |
| `--maxw-prose` | `72ch` | text column cap |

## Typography

- `--font-head`: `Charter, "Bitstream Charter", Georgia, serif` — headings, deck titles in the library.
- `--font-body`: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` — everything else.
- `--font-mono`: `ui-monospace, "SF Mono", "Cascadia Code", Consolas, monospace` — code, file paths, frontmatter.
- Scale (rem): `0.875 / 1 / 1.25 / 1.5 / 2 / 3`. Line-height `1.5` for body, `1.15` for headings.
- One weight per family in the chrome: 400 body, 700 headings. No light weights, no letter-spacing tricks.

## Components

Cross-surface primitives live in `src/components/`; anything used by one route only stays in that module.

| Component | Purpose |
|---|---|
| `DeckCard` | one deck in the library grid — title, topic, tags, updated date |
| `TopicNav` | left-rail list of topics with counts, drives the `/decks` filter |
| `TagChip` | small inert tag label; also the filter toggle on `/decks` |
| `PreviewFrame` | sandboxed iframe that hosts rendered slide HTML for `/edit/:id` |
| `PresentControls` | fullscreen present-mode overlay — slide counter, prev/next, exit |
| `EmptyState` | shown when no decks match, or `SLIDEMASTER_DECKS_DIR` is empty |
| `Icon` | thin wrapper over `react-icons` so the set and size are consistent |

## Do's and don'ts

- **Do** separate regions with `--color-border` hairlines. **Don't** use shadows or cards-on-cards.
- **Do** keep the chrome quiet — it frames the slides, it is not the show. Accent is for one thing per view.
- **Do** use only the five spacing steps. A one-off `13px` margin is a bug.
- **Don't** style slide content from the app's CSS. Slides are Marp-rendered HTML inside `PreviewFrame`; their styling is the Marp theme's job and nothing else's.
- **Don't** add a UI library or a second font family without a design pass.
- **Don't** animate chrome transitions beyond a 120ms opacity/position ease. Motion belongs to a later phase.
