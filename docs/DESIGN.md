# SlideMaster — Design System

Two surfaces live in this file and they are deliberately kept apart:

| Surface | What it is | Mode | Token namespace | Where the CSS lives |
|---|---|---|---|---|
| **Slide template** | The product. A Marp theme rendering deck `.md` at 1280×720 | Persuade, under Read-grade legibility constraints | `--slide-*` | `src/theme/slide-tokens.css` + the theme CSS 1b writes. Plain CSS, **not** in the Tailwind/PostCSS pipeline |
| **App chrome** | `/decks`, `/edit/:id`, `/present/:id`. Frames the slides | Operate | `--chrome-*` | `src/styles/tokens.css`, consumed through Tailwind |

**How to write the styles that implement this** is [`docs/rules/ui-styling.md`](rules/ui-styling.md).
When the two files disagree, this one wins.

**Process note, disclosed rather than hidden.** This system was derived with the
`impeccable` skill, but its `context.mjs` and `concept-seed.mjs` scripts could not be
run (the designing agent has no shell). The direction below was chosen by written
argument against the seven-candidate derivation, not by the roll. A future session with
a shell may re-roll; the four items under *Open questions for the gate* are where that
would land.

---

## Direction — the slide template

### Thesis

**A deck is a sequence of posters, and the section type is a colour event.**

The template refuses the two arrangements this category always ships: the Marp/Slidev
default (white slide, sans heading, bullet list, hairline accent) and its predictable
opposite (near-black slide, neon accent, glow, tracked mono labels). Neither survives
the actual room.

### The room is the brief

Everything below is forced by one scene, written down so it can be argued with:

> A conference room or lecture hall with the lights **on**. A projector with washed-out
> blacks and crushed reds. Someone in row 12, about 12 metres back. The slide is on
> screen for 30–120 seconds. The speaker is the show; the slide is the scaffold.

That scene decides four things that would otherwise be taste:

1. **Light ground for content.** A dark slide on a weak projector in a lit room collapses
   to grey mud. A light ground keeps its contrast when the projector does not.
2. **Grotesk, not serif, as the display voice.** Serif brackets and hairlines are the
   first thing a projector loses. A uniform stroke survives.
3. **Blue, not red or orange, as the one accent.** Projectors crush reds; blue holds.
4. **Type at roughly 3× web scale relative to its canvas.** Derived in *Type scale* below.

### Where it comes from

The **Basel lecture poster** — asymmetric grid, type doing the composing, flat colour
fields, hairline rules. It is the one graphic tradition whose entire purpose is a single
message legible at distance, which is not a metaphor for the requirement here, it *is*
the requirement. Fused with the **film title card**: an interstitial that separates acts
and holds for two seconds, which is exactly what the `intermezzo` and `closing` section
types are.

### What the deck owns that a generic Swiss template does not

Four things, and they are the answer to "what would someone describe an hour later":

1. **The ground carries structure.** Three grounds, never more. Paper for content,
   cobalt field for structural boundaries (title, intermezzo, closing), ink field for
   the one slide that carries someone else's voice (quote). The audience knows a chapter
   changed before reading a word.
2. **The intermezzo shows how much talk is left.** A section-progress rule across the
   foot band — filled for sections reached, ink for sections ahead. Derived from the
   deck's own structure, not authored, not invented.
3. **The profile photo slot is always a cobalt plane.** The photo fills it when supplied.
   There is no substitution and no fallback avatar, because the plane *is* the design and
   the photo is what goes in it. A profile slide with no photo is composed, not patched.
4. **Charter is reserved for other people's words.** The serif appears on exactly two
   slide types — `quote` and `references` — and nowhere else in the product.

### Colour strategy

- **Field slides: Committed.** One saturated colour owns 100% of the surface.
- **Paper slides: Restrained.** Paper ground, ink type, one accent with a job.

### What the accent is for

`--slide-ground-field` / `--chrome-accent` (`#1B4DFF`) does exactly two jobs and no
third:

- **Structure** — the field grounds, the heading rule, reference numbers, the profile
  plane, contact icons.
- **Author-marked emphasis** — `==highlight==` and links, which the author wrote into
  the `.md`.

It never decorates, never marks a bullet, and never appears twice on one paper slide for
two different reasons.

### Motion budget

**Slides never animate.** No slide transition — a cut, not a fade. A transition costs the
speaker's timing and buys nothing. An authored GIF in a deck plays, because the author
chose it.

The only motion in the whole product is chrome: the present overlay's show/hide and
hover/focus feedback, both `--chrome-motion-fast` (120ms) on `opacity` and `transform`
only, both inside a `prefers-reduced-motion: reduce` block that zeroes them.

---

## Canvas, safe area, grid

All values are on the **1280×720** canvas and are absolute. The template never reflows;
`/edit` and `/present` scale the whole 1280×720 frame with `transform: scale()`, so what
is designed is what renders.

```
0                96                                            1184        1280
 ┌───────────────────────────────────────────────────────────────────────────┐ 0
 │  ┌ safe area 1152×648 ─────────────────────────────────────────────────┐  │ 36
 │  │                                                                     │  │
 │  │   ┌ content box 1088×592 ────────────────────────────────────────┐  │  │ 64
 │  │   │                                                              │  │  │
 │  │   │   body region 1088×504                                       │  │  │
 │  │   │   8 cols × 115px, 24px gutters                               │  │  │
 │  │   │                                                              │  │  │
 │  │   │                                                              │  │  │ 568
 │  │   │ ·········· 24px clearance ·································· │  │  │
 │  │   │   foot band 1088×64   [logo]                    [slide no.]  │  │  │ 592
 │  │   └──────────────────────────────────────────────────────────────┘  │  │ 656
 │  │                                                                     │  │
 │  └─────────────────────────────────────────────────────────────────────┘  │ 684
 └───────────────────────────────────────────────────────────────────────────┘ 720
```

- **Safe area** `1152×648` (64px / 36px inset — the broadcast 90% title-safe box). The
  hard boundary: nothing essential ever crosses it. Covers projector overscan and the
  bottom strip that front-row heads block.
- **Content box** `1088×592` at `(96, 64)`. Horizontal margin is larger than vertical on
  purpose: at 16:9 vertical space is the scarce resource, and a wider side margin narrows
  the measure, which is what legibility wants.
- **Body region** `1088×504`. All content. Every section type anchors here.
- **Foot band** `1088×64`, the bottom of the content box. Logo left, slide number right,
  progress rule on intermezzo slides. Body content never enters it.
- **Column grid**: 8 columns of 115px with 24px gutters = 1088 exactly. Eight, not twelve,
  because a slide has fewer and larger regions than a web page. The sanctioned splits are
  **4+4** (532 / 532), **3+5** (393 / 671), **5+3** (671 / 393), and **6** (810, headings).

### Capacity — the numbers an author actually needs

Stated because a spec that does not say how much fits is a spec that gets violated on the
third deck.

| Slide | Fits | Working |
|---|---|---|
| Content slide, heading + bullets | heading plus **~6 lines** of body ≈ 5 bullets | 504 − 91 heading block − 40 gap = 373px ÷ 59.4px per line |
| Code slide, no heading | **10 lines** of code | (504 − 48 panel padding) ÷ 44.8px |
| Code slide, under a heading | **7 lines** of code | (373 − 48) ÷ 44.8px |
| References, with a heading | **~6 entries** | 373px ÷ ~115px per entry, two columns |
| References, no heading | **~9 entries** | 504px ÷ ~115px per entry, two columns |
| Title / closing at `--slide-text-display` | **2 lines**, ~15 characters each | 504 − 190 meta block = 314px ÷ 117.8px per line |
| Title / closing at `--slide-text-xl` | **3 lines**, ~21 characters each | 314px ÷ 87.7px per line |

Every one of those is arithmetic on the region heights above, not an estimate. If 1b's
render disagrees with a number here, one of the two is wrong and it is worth finding out
which before the third deck.

**The template never auto-shrinks to fit.** Content that exceeds the region overflows,
visibly. The fix is the author splitting the slide, which is a *content* decision, not a
design decision — that distinction is the line this product draws.

---

## Type scale — the slide surface

### Why these numbers

Two independent methods converge, which is the only reason to trust either:

1. **Angular.** A projected screen ~2.0m tall in a 12m-deep room. Comfortable reading
   needs a cap height of about *viewing distance ÷ 150* → 80mm at 12m → 4% of screen
   height → ≈29px cap height on a 720px canvas → **≈40px font-size**.
2. **The old presentation rule.** "At least 24pt, ideally 30pt" on a 720×540pt slide.
   30pt is 5.5% of canvas height → **40px on a 720px canvas**.

So: **the slide body floor is 40px.** For comparison, a web page's body is 16px on a
~900px viewport — 1.8% of its canvas. The slide scale is roughly **3× a web scale
relative to its own canvas**, which is the single fact that keeps a designer from
reaching for a web-sized step here.

### The hard rule

**Nothing below 40px carries information the audience must read from their seat.**

One stated exception: `references` entries render at 32px, because a references slide
exists to be *photographed*, not read from row 12. That exception is written down so it
stays an exception.

### The scale

| Token | px | Ratio to next | Use |
|---|---|---|---|
| `--slide-text-display` | 128 | 1.49 | title and closing headline |
| `--slide-text-xl` | 86 | 1.48 | intermezzo heading, quote body, long-title fallback |
| `--slide-text-lg` | 58 | 1.32 | content-slide heading, profile name |
| `--slide-text-md` | 44 | 1.38 | body, bullets, profile role, contact values |
| `--slide-text-sm` | 32 | 1.33 | citations, references, attributions, code |
| `--slide-text-xs` | 24 | — | slide number, foot band, image captions **only** |

Wide steps at the top where distance discrimination matters, tighter at the bottom.

### Faces

Three families, each with a job it is the only candidate for.

| Token | Stack | Job | Why no other face |
|---|---|---|---|
| `--slide-font-display` | Archivo → platform grotesk | Everything on both surfaces | A grotesk with a width axis; the expanded cut uses the horizontal generosity a 16:9 canvas has and a page does not |
| `--slide-font-quote` | Charter → Georgia | `quote` and `references` only | Carter designed Charter for **low-resolution output devices**. A projector is a low-resolution output device. It also signals "not the speaker's words" without a second device |
| `--slide-font-mono` | System mono stack | Fenced code, inline code, file paths | Code needs a fixed advance width. A mono's *character* contributes nothing that syntax highlighting does not already do, so a self-hosted one would be cost without return |

**No web fonts are fetched at runtime.** Archivo ships as a self-hosted `woff2` in the
repo; Charter and the mono stack resolve from the platform. See *Open questions for the
gate* #1 — the Archivo file is not yet in the repo, so the mockup currently renders in
the fallback stack, and the gate reviewer must be told that before they judge the type.

---

## Slide tokens

Authoritative. `src/theme/slide-tokens.css` matches this table exactly, and so does the
token block in `docs/references/template-mockup.html`. All three are checked by command
in `docs/tasks/1a-step-02-template-spec.md`.

### Canvas and grid

| Token | Value | Use |
|---|---|---|
| `--slide-canvas-w` | `1280px` | canvas width |
| `--slide-canvas-h` | `720px` | canvas height |
| `--slide-safe-x` | `64px` | horizontal title-safe inset |
| `--slide-safe-y` | `36px` | vertical title-safe inset |
| `--slide-margin-x` | `var(--slide-space-6)` | content box left/right margin (96px) |
| `--slide-margin-y` | `var(--slide-space-5)` | content box top/bottom margin (64px) |
| `--slide-col` | `115px` | one grid column |
| `--slide-gutter` | `var(--slide-space-3)` | grid gutter (24px) |
| `--slide-content-w` | `calc(var(--slide-canvas-w) - 2 * var(--slide-margin-x))` | 1088px |
| `--slide-content-h` | `calc(var(--slide-canvas-h) - 2 * var(--slide-margin-y))` | 592px |
| `--slide-foot-h` | `var(--slide-space-5)` | foot band height (64px) |
| `--slide-body-h` | `calc(var(--slide-content-h) - var(--slide-foot-h) - var(--slide-space-3))` | 504px |
| `--slide-span-3` | `calc(3 * var(--slide-col) + 2 * var(--slide-gutter))` | 393px |
| `--slide-span-4` | `calc(4 * var(--slide-col) + 3 * var(--slide-gutter))` | 532px |
| `--slide-span-5` | `calc(5 * var(--slide-col) + 4 * var(--slide-gutter))` | 671px |
| `--slide-span-6` | `calc(6 * var(--slide-col) + 5 * var(--slide-gutter))` | 810px |

### Spacing

Seven steps. Steps 1–3 are type-level (inside a text group); steps 4–7 are layout-level
(between blocks, and margins). A value not on this list is a bug.

| Token | Value | Use |
|---|---|---|
| `--slide-space-1` | `8px` | icon gap, progress-rule gap |
| `--slide-space-2` | `16px` | between list items, between reference entries |
| `--slide-space-3` | `24px` | gutter, panel padding, heading-to-rule |
| `--slide-space-4` | `40px` | heading block to body, list indent |
| `--slide-space-5` | `64px` | vertical margin, foot band |
| `--slide-space-6` | `96px` | horizontal margin |
| `--slide-space-7` | `128px` | field-slide internal offsets |

### Colour

Named by **ground**, so misuse is visible at the call site. Contrast ratios are measured,
not asserted.

| Token | Value | Use | Contrast |
|---|---|---|---|
| `--slide-ground-paper` | `#F4F4F2` | content, profile, references, contact, code, image | — |
| `--slide-ground-field` | `#1B4DFF` | title, intermezzo, closing | — |
| `--slide-ground-ink` | `#14161A` | quote; progress-rule "ahead" segments | — |
| `--slide-on-paper` | `#14161A` | body and headings on paper | **16.5:1** on paper |
| `--slide-on-paper-muted` | `#52565E` | captions, dates, slide number on paper | **6.7:1** on paper |
| `--slide-on-paper-accent` | `#1B4DFF` | heading rule, links, highlights, icons, ref numbers | **5.4:1** on paper |
| `--slide-on-field` | `#FFFFFF` | display type on a cobalt field | **5.9:1** on field |
| `--slide-on-field-muted` | `#DCE3F8` | meta lines and slide number on a cobalt field | **4.6:1** on field |
| `--slide-on-ink` | `#FFFFFF` | quote body | **18.1:1** on ink |
| `--slide-on-ink-muted` | `#9AA0AC` | quote source line | **6.9:1** on ink |
| `--slide-on-ink-accent` | `#8FA9FF` | quote attribution | **8.0:1** on ink |
| `--slide-surface` | `#E9E9E5` | code panel, inline-code background | — |

`--slide-on-paper-accent` and `--slide-on-ink-accent` are different values of the same
idea because cobalt on near-black is only 3.1:1 — enough for a graphic, not for a line of
text someone has to read. Shipping one token and hoping would have been the bug.

### Code

Four colours plus plain ink. **Anything a highlighter would give a fifth colour gets
`--slide-code-plain`.** No line numbers, no window chrome, no fake traffic lights.

| Token | Value | Use | Contrast on `--slide-surface` |
|---|---|---|---|
| `--slide-code-plain` | `var(--slide-on-paper)` | identifiers, punctuation, everything unclassified | 14.9:1 |
| `--slide-code-keyword` | `var(--slide-on-paper-accent)` | keywords, operators | 4.9:1 |
| `--slide-code-string` | `#1F6B3A` | strings, template literals | 5.4:1 |
| `--slide-code-literal` | `#A3200F` | numbers, booleans, null | 6.2:1 |
| `--slide-code-comment` | `var(--slide-on-paper-muted)` | comments | 6.1:1 |

### Type

| Token | Value | Use |
|---|---|---|
| `--slide-font-display` | `"Archivo", "Helvetica Neue", Helvetica, "Liberation Sans", Arial, sans-serif` | everything except quote, references, code |
| `--slide-font-quote` | `Charter, "Bitstream Charter", "Charis SIL", Georgia, serif` | `quote` body, `references` entries |
| `--slide-font-mono` | `ui-monospace, "Cascadia Mono", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace` | code, file paths, contact handles |
| `--slide-text-display` | `128px` | title, closing |
| `--slide-text-xl` | `86px` | intermezzo, quote, long-title fallback |
| `--slide-text-lg` | `58px` | content heading, profile name |
| `--slide-text-md` | `44px` | body floor |
| `--slide-text-sm` | `32px` | citations, code, attributions |
| `--slide-text-xs` | `24px` | foot band, captions |
| `--slide-leading-display` | `0.92` | display type |
| `--slide-leading-xl` | `1.02` | xl type |
| `--slide-leading-lg` | `1.08` | headings |
| `--slide-leading-body` | `1.35` | body and bullets |
| `--slide-leading-sm` | `1.4` | small text and code |
| `--slide-track-display` | `-0.03em` | display; floor is -0.04em |
| `--slide-track-lg` | `-0.015em` | headings |
| `--slide-track-body` | `0em` | body |
| `--slide-track-xs` | `0.06em` | uppercase foot-band labels |
| `--slide-weight-display` | `700` | display |
| `--slide-weight-heading` | `600` | headings, profile name |
| `--slide-weight-body` | `400` | body |
| `--slide-weight-strong` | `700` | `**bold**` |
| `--slide-measure-display` | `14ch` | forces display type to stack — the poster signature |
| `--slide-measure-body` | `46ch` | bullet cap; longer than this is a sentence, and a sentence on a slide is a script |
| `--slide-measure-quote` | `22ch` | a normal quote lands in 3–4 lines |

### Marks and geometry

| Token | Value | Use |
|---|---|---|
| `--slide-rule-hair` | `1px` | the only hairline weight |
| `--slide-rule-thick` | `4px` | heading rule, highlight underline, progress rule |
| `--slide-marker` | `10px` | bullet square |
| `--slide-icon` | `48px` | contact-row icons |
| `--slide-logo-h` | `32px` | logo cap height in the foot band |
| `--slide-underline-offset` | `8px` | `==highlight==` underline offset |
| `--slide-qr` | `240px` | contact QR image, when the author supplies one |
| `--slide-radius` | `0` | no rounded corners anywhere on a slide |
| `--slide-shadow` | `none` | no elevation on a slide, ever |

---

## Section anatomy — all seven types

The per-slide key is `section:`. Absent → the default content slide.

**One rule governs every absence, and it is the reason the template holds together:**

> **When an optional field is absent, the block that would have held it does not render,
> and nothing else moves.** No recentring, no re-spanning, no placeholder, no inferred
> value, no em-dash standing in for a missing name. A field-complete slide and a
> field-sparse slide put their shared content in the same pixel.

That rule is what makes absence invisible instead of broken, and it is the mechanical
expression of `docs/PRODUCT.md`'s "the app never invents content".

---

### 1. `title`

**Ground** cobalt field. **Anchor** display block bottom-left of the body region.

| Key | Required | Renders as |
|---|---|---|
| `title` | yes | `--slide-text-display`, `--slide-on-field`, `--slide-measure-display`, stacked, bottom-anchored |
| `speaker` | no | meta line, `--slide-text-sm`, `--slide-on-field-muted` |
| `event` | no | meta line |
| `date` | no | meta line |

Meta lines sit above the display block, stacked, separated by `--slide-space-1`.

**Absent-field behaviour**
- Any of `speaker` / `event` / `date` absent → that line does not render; remaining lines
  close up.
- All three absent → the meta block does not render. **The title does not move** — it is
  bottom-anchored, so a bare title and a full-meta title put the headline in the same place.
- `title` absent → not a supported state. A deck with no title has no library row either
  (`docs/PRODUCT.md`: metadata comes from frontmatter); the renderer surfaces this as an
  error rather than writing "Untitled".

**Long titles.** Two thresholds, both derived from the capacity table:

| `title` length | Renders at | Lines available |
|---|---|---|
| ≤ 30 characters | `--slide-text-display` (128px) | 2 |
| 31–64 characters | `--slide-text-xl` (86px) | 3 |
| > 64 characters | `--slide-text-xl`, and it overflows | — |

1b sets `data-len="short|long"` on the heading from the frontmatter string length.
**The author never chooses; the pipeline measures.** Past 64 characters the template
stops helping and the author shortens the title, which is a content decision.

**The slide number does not render on a title slide.** A title slide numbered "1" is noise.
**The logo does not render on any field slide** — see *Logo* below.

---

### 2. `profile`

**Ground** paper. **Grid** 3+5.

| Key | Required | Renders as |
|---|---|---|
| `name` | yes* | `--slide-text-lg`, `--slide-weight-heading`, ink |
| `photo` | no | fills the cobalt plane, `object-fit: cover` |
| `role` | no | `--slide-text-md`, `--slide-on-paper-muted` |
| `org` | no | same line as `role`, after a template-drawn middot |
| `bio` | no | `--slide-text-md`, ink, capped at `--slide-measure-body` |
| `links[]` | no | `--slide-font-mono`, `--slide-text-sm`, `--slide-on-paper-accent`, one per line, under a `--slide-rule-thick` cobalt rule |

Columns 1–3 (`--slide-span-3`, 393×504) are **always** a `--slide-ground-field` plane.
The photo fills it when supplied. There is no fallback avatar, no initials monogram, no
silhouette — those are inferred content and `docs/PRODUCT.md` forbids them.

Columns 4–8 (`--slide-span-5`, 671px) hold the text block, top-aligned with the plane.

**Absent-field behaviour**
- No `photo` → the plane renders as flat cobalt. The text block does not move or widen.
- No `role` → omitted. No `org` → omitted, **and the middot is not drawn**; `role` alone
  renders alone, with no "at ___".
- No `links` → the cobalt rule and the list both disappear. The rule exists to separate
  the list; with no list there is nothing to separate.
- No `bio` → nothing renders in its place and nothing moves up.
- \* `name` falls back to the deck-level `speaker` when present, because that value was
  **authored by the user**, not inferred. If neither exists the name line is omitted.
  See *Open questions for the gate* #3 — this is a judgment call the owner may overrule.

---

### 3. `intermezzo`

**Ground** cobalt field. **Anchor** heading block centred vertically, left at the margin.

| Key | Required | Renders as |
|---|---|---|
| `heading` | no | `--slide-text-xl`, `--slide-on-field`, `--slide-measure-display`, stacked |

**There is no kicker, eyebrow, or `label` key.** Deliberately: a label above a heading is
a device this system does not use, and every key the author can get wrong is a design
decision the product exists to remove.

**Section progress rule.** The foot band carries one full-width rule divided into N equal
segments (`--slide-rule-thick` tall, `--slide-space-1` gaps, `flex: 1` each), where N is
the number of `intermezzo` slides in the deck. Segments reached render
`--slide-on-field`; segments ahead render `--slide-ground-ink` (3.1:1 against the field —
enough for a graphic, which is what it is).

This is **derived from the deck's own structure**, like a slide number, not invented
content. It answers the one question every audience has and no deck ever answers: how
much is left.

**Absent-field behaviour**
- No `heading` → the slide renders as an empty cobalt field. This is a legitimate slide —
  a beat before the next part — not a failure.
- Fewer than 3 `intermezzo` slides in the deck → the progress rule does not render at all.
  A two-segment bar carries no information.

---

### 4. `quote`

**Ground** ink field. The one slide in the product that is not paper or cobalt, because
it is the one slide carrying a voice that is not the speaker's.

| Key | Required | Renders as |
|---|---|---|
| `quote` | no | `--slide-font-quote`, `--slide-text-xl`, `--slide-on-ink`, `--slide-measure-quote` |
| `attribution` | no | `--slide-text-sm`, `--slide-font-display`, `--slide-on-ink-accent` |
| `source` | no | `--slide-text-sm`, `--slide-on-ink-muted`, below attribution |

The opening quotation mark **hangs into the margin** (`hanging-punctuation: first`, with a
negative `text-indent` fallback for engines that lack it). This is the detail that makes a
quote slide look set rather than typed, and it is the reason the quote block starts at the
margin and not indented from it.

**Absent-field behaviour**
- No `attribution` → nothing renders. **The template never writes "Anonymous", "Unknown",
  or "— ?"**. An unattributed quote is a legitimate thing an author may do.
- No `source` → the line is omitted; the attribution line is anchored, not centred as a
  group, so it does not shift.
- No `quote` → an empty ink field. Consistent with `intermezzo`.

---

### 5. `references`

**Ground** paper. **Grid** 4+4. Designed to be **photographed**, which is the only reason
it is allowed below the 40px floor.

| Key | Required | Renders as |
|---|---|---|
| `heading` | no | `--slide-text-lg`, ink, spanning `--slide-span-6` |
| `references[]` | no | numbered list, two columns, `--slide-space-2` between entries |
| `references[].text` | yes per entry | `--slide-font-quote`, `--slide-text-sm`, ink, hanging indent |
| `references[].url` | no | `--slide-font-mono`, `--slide-text-xs`, `--slide-on-paper-accent`, on its own line |

The number marker is `--slide-font-display`, `--slide-on-paper-accent`, right-aligned in a
`--slide-space-4` gutter so entry text stays flush at 1 and at 10. Numbers earn their place
here because they are referred to aloud ("see reference four"); they are not decoration.

Entries use a hanging indent — the bibliography convention, and the thing that makes a
citation scannable when it wraps.

**Absent-field behaviour**
- No `heading` → nothing renders and the list starts at the top of the body region. **The
  template does not supply the word "References".** See *Open questions for the gate* #2.
- No `url` on an entry → just the text. No "[link]", no "n.d.", no bracket.
- No entries at all → the slide renders with whatever heading exists, or blank. **It is
  not omitted** — silently dropping a slide shifts every slide number after it, which is
  worse than a blank slide.
- More than ~6 entries under a heading (~9 without one) → overflows visibly. The type does
  not shrink. A talk with 20 sources gets two `references` slides.

---

### 6. `contact`

**Ground** paper. **Grid** 5+3.

| Key | Required | Renders as |
|---|---|---|
| `heading` | no | `--slide-text-lg`, ink |
| `contacts[]` | no | stacked rows, `--slide-space-3` apart |
| `contacts[].label` | no | `--slide-text-sm`, `--slide-on-paper-muted` |
| `contacts[].value` | yes per row | `--slide-text-md`, `--slide-font-mono`, ink |
| `contacts[].icon` | no | `--slide-icon` (48px) inline SVG, `--slide-on-paper-accent` |
| `contacts[].url` | no | makes `value` a link; does not change its appearance |
| `qr` | no | author-supplied image, `--slide-qr` square, columns 6–8 |

**Absent-field behaviour**
- No `icon` on a row → **the icon column keeps its width**. The row's text does not shift
  left, so every row stays aligned whether or not its neighbours have icons. This is the
  detail that separates a spec from a wish.
- No `label` → the value line renders alone, in the same vertical position the value would
  have had.
- No `qr` → columns 6–8 are empty. The contact block stays in columns 1–5 and does not
  recentre.
- `qr` is **never generated from a URL**. It is an image file the author supplies. See
  *Open questions for the gate* #4.

Icons come from Lucide (`react-icons/lu`) per `docs/rules/ui-styling.md`. **Implementation
note for 1b:** the slide HTML is Marp output, not React, so `react-icons` components cannot
render into a slide. The pipeline must resolve an icon name to **inline SVG** at render
time. Discovering that late is expensive.

---

### 7. `closing`

**Ground** cobalt field. **Composition is identical to `title`** — display type,
bottom-left, same anchor — so the deck's first and last slide rhyme.

| Key | Required | Renders as |
|---|---|---|
| `message` | no | `--slide-text-display`, `--slide-on-field`, `--slide-measure-display` |
| deck `speaker` | no | echoed at `--slide-text-sm`, `--slide-on-field-muted`, foot-band position |

**Absent-field behaviour**
- No `message` → an empty cobalt field. Which is a real closing slide: you stand in front
  of a blue wall and take questions. **The template never writes "Thank you".**
- No deck-level `speaker` → the echo line does not render.

---

### Default content slide (no `section` key)

**Ground** paper. **Grid** 8 columns, or 4+4 when an image is present.

**Heading** — markdown `#` or `##`. `--slide-text-lg`, `--slide-weight-heading`,
`--slide-track-lg`, spanning `--slide-span-6` (≈24ch measure). Below it, at
`--slide-space-3`: a **cobalt rule**, `--slide-rule-thick` tall and `--slide-col` (115px)
wide. That rule is the template's signature mark. It appears on every content slide, in
exactly one place, and it is the only accent a plain content slide carries.

**Bullets** — `--slide-text-md`, `--slide-leading-body`, capped at `--slide-measure-body`.
Marker is a `--slide-marker` ink square, not cobalt: cobalt marks structure and
author-marked emphasis, and a bullet marker is neither.

**Nesting** — two levels maximum, indent `--slide-space-4`. Level 2's marker is a short
ink dash. **A third level renders at level 2's style**; the template does not invent a
third mark. Three levels of nesting on a slide means the slide should be two slides.

**Ordered lists** — numbers in ink at `--slide-text-md`, right-aligned in a
`--slide-space-4` gutter so text is flush at 1 and at 10.

**Emphasis**
- `**bold**` → `--slide-weight-strong`, ink. Weight carries emphasis; colour does not.
- `*italic*` → Archivo italic. Never a serif swap mid-line.
- `==highlight==` → a `--slide-rule-thick` cobalt underline at `--slide-underline-offset`
  below the baseline (`text-decoration-thickness` + `text-underline-offset`). **Not a
  yellow marker-pen background** — that is the templated default and it fails at distance,
  because it lowers the contrast of the exact words you wanted read.
- Inline code → `--slide-font-mono` at `0.9em` on `--slide-surface`, `--slide-radius` 0.

**Images** (jpg / png / gif). Two placements, chosen by the markdown's shape, not by an
author flag:
1. Image is the **only** child of the body region → fills 1088×504, `object-fit: cover`,
   no border, no radius.
2. Image follows a heading and text → columns 5–8 (`--slide-span-4`, 532px), top-aligned
   with the heading, height capped at `--slide-body-h`, `object-fit: cover`. Text takes
   columns 1–4.

- **Caption**: renders only from the markdown title attribute — `![alt](src "caption")` —
  at `--slide-text-xs`, `--slide-on-paper-muted`, `--slide-space-2` below the image.
  **`alt` is never printed as a caption.** `alt` is for the DOM; printing it puts text on
  the slide the author wrote for a screen reader.
- **GIFs animate.** The deck is authored content and `prefers-reduced-motion` does not
  override the author's choice inside a slide. It *does* govern the chrome around it.

**Logo** — foot band, left edge, capped at `--slide-logo-h`, vertically centred. Renders
**only** when the deck frontmatter supplies `logo` as a path. No default mark, no favicon
fallback, no app logo — `docs/PRODUCT.md` forbids an inferred logo.
It renders on **paper slides only**: the file is the author's and its colours are unknown,
so putting it on a cobalt or ink field is a coin flip.

**Slide number** — foot band, right edge, `--slide-text-xs`, muted-for-its-ground. A bare
integer, not `n / total`: the intermezzo progress rule already answers "how much is left",
and answering it twice is noise.

---

## Direction — the app chrome

The chrome is the **paper register of the slide system with none of the field colour**, so
the two surfaces are visibly one family without the frame competing with the picture.

Two committed ideas:

1. **The chrome sits on the slide's own grid** — 8 columns, 24px gutters, 96px outer
   margin, scaled to the viewport. Opening the app looks like looking at the deck system
   from outside.
2. **`/decks` has no header bar.** A topic rail and a list. The app's name is set once, in
   the rail's head. No logo lockup, no nav chrome. The chrome is not the show.

### Chrome tokens

Authoritative. `src/styles/tokens.css` matches this table exactly.

| Token | Value | Use |
|---|---|---|
| `--chrome-bg` | `#F4F4F2` | app background — the same paper as a slide |
| `--chrome-surface` | `#FFFFFF` | panels, the preview frame's backing |
| `--chrome-scrim` | `#14161A` | present-mode letterbox and control bar |
| `--chrome-fg` | `#14161A` | primary text — 16.5:1 on bg |
| `--chrome-fg-muted` | `#52565E` | metadata, counts, dates — 6.7:1 on bg |
| `--chrome-fg-on-accent` | `#FFFFFF` | text on cobalt — 5.9:1 |
| `--chrome-fg-on-scrim` | `#FFFFFF` | text and icons on the present bar — 18.1:1 |
| `--chrome-accent` | `#1B4DFF` | links, active state, focus — 5.4:1 on bg |
| `--chrome-border` | `#8C8C86` | boundaries a user must perceive: inputs, card edges — 3.1:1 on bg |
| `--chrome-rule` | `#D2D2CD` | decorative dividers only — 1.4:1, and exempt because it conveys nothing |
| `--chrome-focus` | `#1B4DFF` | focus ring on light grounds |
| `--chrome-focus-on-scrim` | `#FFFFFF` | focus ring inside the present overlay |
| `--chrome-space-1` | `4px` | icon-to-label |
| `--chrome-space-2` | `8px` | inside a control |
| `--chrome-space-3` | `16px` | between related rows |
| `--chrome-space-4` | `24px` | between groups |
| `--chrome-space-5` | `40px` | between regions |
| `--chrome-space-6` | `64px` | page margin |
| `--chrome-radius` | `0` | no rounded corners |
| `--chrome-shadow-overlay` | `0 4px 24px rgba(20, 22, 26, 0.32)` | the **only** shadow in the product: the present bar, which floats over content |
| `--chrome-font-ui` | `"Archivo", "Helvetica Neue", Helvetica, "Liberation Sans", Arial, sans-serif` | everything |
| `--chrome-font-mono` | `ui-monospace, "Cascadia Mono", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace` | paths, frontmatter, deck ids |
| `--chrome-text-xs` | `0.8125rem` | tag chips, counts |
| `--chrome-text-sm` | `0.875rem` | metadata |
| `--chrome-text-md` | `1rem` | body |
| `--chrome-text-lg` | `1.25rem` | deck title in the list |
| `--chrome-text-xl` | `1.625rem` | topic heading |
| `--chrome-text-2xl` | `2.25rem` | page `h1` |
| `--chrome-leading-body` | `1.5` | body |
| `--chrome-leading-head` | `1.2` | headings |
| `--chrome-weight-body` | `400` | body |
| `--chrome-weight-strong` | `600` | headings, active items |
| `--chrome-measure` | `72ch` | text column cap |
| `--chrome-rail-w` | `240px` | topic rail |
| `--chrome-overlay-h` | `56px` | present control bar |
| `--chrome-thumb-w` | `160px` | editor slide-strip thumbnail (1/8 of canvas) |
| `--chrome-thumb-h` | `90px` | editor slide-strip thumbnail |
| `--chrome-target-min` | `44px` | minimum touch target |
| `--chrome-focus-ring` | `3px` | focus outline width |
| `--chrome-motion-fast` | `120ms` | the only duration |
| `--chrome-motion-ease` | `cubic-bezier(0.2, 0, 0, 1)` | the only easing |

**Charter is not a chrome font.** Keeping the serif to `quote` and `references` is what
makes it mean something; spending it on deck titles in the library would make it
decoration.

### Why the two token sets differ

They are namespaced rather than shared because the surfaces have genuinely different
physics, and merging them would force one of them to be wrong:

- **Scale.** Chrome body is 16px on a ~900px viewport; slide body is 44px on a 720px
  canvas. A shared type scale would be three times too small in one place or three times
  too big in the other.
- **States.** Chrome needs hover, focus, disabled, active. A slide has no states at all —
  nobody clicks a slide.
- **Spacing granularity.** Chrome needs 4px and 8px for the inside of a control. A slide
  has no controls, and its smallest meaningful distance is 8px.
- **Pipeline.** `--chrome-*` is read through Tailwind. `--slide-*` is plain CSS handed to
  Marp and never touched by PostCSS. A shared file would put a Tailwind-processed value in
  a place Tailwind never runs, and that fails **silently** — see `docs/rules/ui-styling.md`.

The values they share (`#F4F4F2`, `#14161A`, `#52565E`, `#1B4DFF`, radius `0`) are shared
on purpose: it is one family, seen from two distances.

### Components

Cross-surface primitives live in `src/components/`; anything one route uses stays in its
module.

| Component | Purpose |
|---|---|
| `DeckRow` | one deck in the library **list** — title, topic, tags, updated |
| `TopicNav` | left rail, topics with counts, drives the `/decks` filter |
| `TagChip` | inert tag label; also the filter toggle |
| `PreviewFrame` | sandboxed iframe hosting rendered slide HTML |
| `SlideStrip` | thumbnail strip under the editor preview |
| `PresentControls` | the present-mode overlay |
| `EmptyState` | no decks match, or the decks dir is empty |
| `Icon` | thin `react-icons/lu` wrapper — one set, one size, one stroke |

**`DeckCard` is renamed `DeckRow`, and the library is a list, not a card grid.** The user
has somewhere between 8 and 40 decks, knows what they are called, and is scanning for a
name. A list scans faster than a grid and puts `updated` in a column you can compare down.
A grid of same-shaped cards would be the category default doing none of that work.

### `/decks`

Topic rail (`--chrome-rail-w`, `--chrome-rule` right edge) plus a list. Rows separated by
`--chrome-rule` hairlines, `--chrome-space-4` vertical padding. Title at
`--chrome-text-lg` / `--chrome-weight-strong`; topic, tags, and updated on one muted meta
line at `--chrome-text-sm`.

Active topic: `--chrome-fg` at `--chrome-weight-strong`, and its count chip inverts to
`--chrome-accent` with `--chrome-fg-on-accent`. **Not** a coloured left border — a
coloured border-left above 1px on a list item is the device this system does not use.

`EmptyState` copy names the problem and the recovery, with the real path substituted:

> **No decks in `<SLIDEMASTER_DECKS_DIR>`.**
> Add a `.md` file there and it appears here.

That is real copy, not a placeholder, so it carries no `TODO(content)` marker.

### `/edit/:id`

`PreviewFrame` is a 1280×720 frame scaled with `transform: scale()` and
`transform-origin: top left` — **never re-laid-out**, so the preview is the render.
`--chrome-border` hairline around it.

`SlideStrip` below: `--chrome-thumb-w` × `--chrome-thumb-h` thumbnails (exactly 1/8 of
canvas). The active thumbnail is marked with a `--chrome-focus-ring` cobalt bar **beneath**
it, not a coloured left border.

Per `docs/rules/ui-styling.md`, the iframe is sandboxed `allow-same-origin` only. The app's
CSS never reaches into it.

### `/present/:id`

**Fully keyboard-operable is a hard requirement**, not a nicety (`docs/rules/accessibility.md`).

| Key | Action |
|---|---|
| `ArrowRight` · `ArrowDown` · `Space` · `PageDown` | next slide |
| `ArrowLeft` · `ArrowUp` · `PageUp` | previous slide |
| `f` | toggle fullscreen |
| `Esc` | exit present mode |

The slide is letterboxed to 16:9 against `--chrome-scrim`. Ink, not pure black, and
deliberately the same value as the `quote` ground so a quote slide reads full-bleed.

**`PresentControls` overlay.** Bottom-centred bar, `--chrome-overlay-h` tall,
`--chrome-scrim` ground, `--chrome-shadow-overlay`. Contents left to right: previous,
slide counter (`n / total`), next, fullscreen toggle, exit. Icons at 20px,
`--chrome-fg-on-scrim`. Every button is at least `--chrome-target-min` square.

Three behaviours that are easy to get wrong and expensive to discover on stage:

1. **Hidden by default.** It appears on pointer move or any keypress and auto-hides after
   2000ms of no input.
2. **It must also appear, and stay, while any control inside it has focus.** Otherwise a
   keyboard user tabs into an invisible toolbar. This is the failure nothing else catches.
3. **The focus ring flips to `--chrome-focus-on-scrim` (white) inside the overlay.** Cobalt
   on ink is 3.1:1 — a focus ring that technically passes and practically vanishes. White
   on ink is 18.1:1.

The show/hide is `--chrome-motion-fast` on `opacity`. Under
`prefers-reduced-motion: reduce` it appears and disappears instantly. There is **no slide
transition** under any setting.

### Responsive

Desktop is the real scene, but nothing may break at 320px (`docs/rules/ui-styling.md`).

| Width | Behaviour |
|---|---|
| ≥ 1024px | Topic rail + list. `/edit` preview at natural scale |
| 768–1023px | Rail collapses to a `<select>` above the list |
| < 768px | One-column list; deck title drops to `--chrome-text-lg`; topic/tags/updated stack under the title instead of sharing a meta line; tag chips wrap |
| 375px | Checked explicitly: the title/meta hierarchy must still read as title-then-meta, not as four equal lines |
| 320px | Nothing scrolls horizontally. `/edit` preview scales to viewport width |

`/present` keeps working at every width because its controls are already
`--chrome-target-min` and its keyboard map does not depend on layout.

---

## Do's and don'ts

- **Do** keep the ground meaningful. Paper = content, cobalt = structural boundary, ink =
  someone else's voice. A fourth ground is a redesign, not a slide.
- **Do** let an absent field leave a hole. **Don't** fill it with an avatar, an em-dash,
  "Untitled", "Anonymous", or "Thank you".
- **Do** use only the seven slide steps and the six chrome steps. A one-off `13px` is a bug.
- **Don't** style slide content from the app's CSS. Slide appearance is 100% the Marp
  theme's, and a Tailwind class on a slide element does nothing and throws nothing.
- **Don't** add a fourth font family, or spend Charter outside `quote` and `references`.
- **Don't** animate a slide, ever. Don't add a slide transition.
- **Don't** auto-shrink type to make content fit. Overflow visibly and let the author split.
- **Don't** put a logo, a slide number, or a photo fallback anywhere the author did not
  supply one.

---

## The mockup

`docs/references/template-mockup.html` renders all seven section types plus a default
content slide, a code slide, and an image slide, at 1280×720, from a token block that is a
verbatim copy of `src/theme/slide-tokens.css`.

**Its content is specimen text and is app-adjacent reference material. It is never shipped
as deck content, never copied into a real deck, and never used as a default.** The file
carries one `TODO(content)` marker covering all of its visible text, per `AGENTS.md` hard
rule 2.

Two things the reviewer must know before judging it:

- It renders in the **fallback** type stack, because the Archivo file is not in the repo
  yet (open question #1).
- `docs/references/*` is **gitignored**. As written, this file is not committed. Un-ignoring
  it is a named deliverable in `docs/tasks/1a-step-02-template-spec.md`.

---

## Open questions for the gate

The system below is settled; these four are not, and each is the owner's call rather than
the designer's. Every one has a stated default, so none of them blocks 1b from starting.

1. **Ship Archivo self-hosted, or accept the platform grotesk?**
   Self-hosting is two `woff2` files in `public/fonts/`, roughly 120KB, zero network at
   runtime, and it embeds cleanly in the Phase 2 PDF export. The fallback — Helvetica
   Neue / Liberation Sans / Arial — works everywhere and costs nothing, but it is the
   platform sans doing display duty, which is the difference between a template with a
   voice and Marp's default with different margins.
   *Default if unanswered: ship Archivo.* **The mockup currently shows the fallback.**

2. **Is the word "References" content or chrome?**
   `docs/PRODUCT.md` says the app never invents a headline. The spec above therefore
   supplies no default heading on a `references` slide. A reasonable owner may decide that
   a structural label on a structural slide is template chrome, not authored content.
   *Default if unanswered: no default heading.*

3. **May `profile.name` fall back to the deck-level `speaker`?**
   The spec allows it, on the reading that reusing an authored value is not inference. The
   stricter reading is that the app should render nothing the `profile` block did not
   supply.
   *Default if unanswered: the fallback is allowed.*

4. **May a `contact` QR be generated from a URL?**
   Generating a QR is arguably derivation, not fabrication — but it is an image the app
   puts on a slide that the author did not supply. The spec forbids it.
   *Default if unanswered: the author supplies the image.*

And one thing the gate cannot skip, which is not a question but a gap:

> **`1a-gate-template` question 1 asks whether the mockup renders a *real past
> presentation*. It does not — it renders specimen content.** No real deck exists in this
> repo yet. Pouring one real past talk into the mockup's frames, before signing off, is the
> only way that question gets a truthful answer, and it is the cheapest place to find out
> where the template fights real content.
