# SlideMaster — Product


## Problem & solution

I give a lot of presentations and I want to stop making design decisions for each one. I already write in Markdown and I live in git. I want to write only the content and the section structure of a talk, render it to HTML slides through one finalized template, and keep every talk in a local library organized by topic. Storage is local SQLite; the Markdown files live in the repo.

A local-first web app. You write each deck as a Markdown file with per-slide frontmatter; the app renders it to HTML slides with @marp-team/marp-core through a single opinionated master template. You browse decks by topic, live-preview while editing the .md in your own editor, and present fullscreen in the browser. A SQLite database indexes decks by title, topic and tags; the .md files remain the source of truth.

## Vision

A personal, versioned library of every talk the author gives: content in Markdown, a section type per slide, present from the browser. Later, multiple templates and richer slide types (LaTeX, charts, layout modes) on the same pipeline.

The renderer is a solved problem (Marp, Slidev), so this doesn't build one - it wraps Marp core. The only things owned here are one finalized template and a personal topic-indexed catalog. Because the author already writes talks in Markdown and git, the switching cost is near zero, and doing the template decisions once removes them from every future deck.

## Who the user is

The author only - a person who presents frequently and already works in Markdown and git. Explicitly not multi-user; no accounts, no sharing, no hosting.

## Target market

Personal tool, no external market. The Marp theme and render pipeline could be open-sourced later, but that is not a goal.

## Competitors & alternatives

Marp and Slidev (Markdown-to-HTML slide decks, themeable, dev-oriented); reveal.js and remark; Pandoc + Beamer. The real competitor is the do-nothing option: Google Slides, Canva, PowerPoint plus the habit of using them.

Not a general-purpose slide tool. One opinionated, finalized template plus a topic-indexed personal library, built on Marp core so the rendering engine is not the author's to maintain. The value proposition is zero design decisions per deck, not a feature list.

## Business model

None. Personal tool, not for sale.

## Goals & success metrics

Within 6-12 months: at least 8 real presentations delivered from slidemaster decks; zero decks where the author fell back to Google Slides or Canva; the master template unchanged after the third deck.

## What must never be fabricated

Slide content is authored by the user in the deck `.md` file. The app renders it; it never invents it.

- No generated headline, bullet, quote, citation, statistic, or reference ever appears in a rendered deck. If the `.md` does not supply it, the slide does without it.
- No `Lorem ipsum` or placeholder copy in a rendered deck, present view, or exported artifact. Placeholder copy is allowed only in app chrome (empty states, examples in docs) and carries the placeholder marker (see `AGENTS.md` hard rule 2).
- The `profile`, `contact`, and `references` section slides display only the fields the deck's frontmatter provides — no inferred job title, employer, social handle, or logo.
- Deck metadata shown in the library (title, topic, tags, dates) comes from the `.md` frontmatter and the filesystem. The app does not guess a topic or backfill a date.

## Decisions still the product owner's

That the author will keep writing decks in Markdown rather than falling back to Google Slides or Canva the first time a talk needs a custom chart, a tight image layout, or a diagram. Cheapest test: rebuild the most recent real presentation in Marp in about an hour, before building anything, and see where the constraints hurt.
