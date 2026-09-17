# 1a-gate-template

The one master template is the product. This gate is where a human looks at it on a
screen and says it is finished, before any render-pipeline code is written against it.

## Decision Maker

Human owner (the author — the only user of this tool).

## Unblocks

The Marp render pipeline and the theme CSS — the work that implements the look
this gate signs off.

**Not the data layer.** The SQLite index, reconcile, and the deck library are
independent of how a slide looks, and gating them behind a design sign-off was
over-broad. They proceeded in `0-step-03`.

## Questions

Do not leave these unasked:

1. Does the static mockup render a **real** past presentation well — not a contrived demo deck? Where did the template fight the content?
2. Are all seven section types (title, profile, intermezzo, quote, references, contact, closing) shown, and does each one still read correctly when optional frontmatter fields are missing?
3. Is the type scale legible from the back of a room at 1280×720? Has it been checked at that size, not in a browser at 50%?
4. Is there any decision this template leaves to the deck author? Each one is a design decision per deck, which is the thing this product exists to remove.
5. Does the accent colour carry meaning consistently, or is it decoration?
6. Would you present this deck to the audience you actually present to?
7. What is explicitly **not** solved by this template, and is that acceptable until Phase 3 (layout modes) rather than a reason to redesign now?

## Evidence — the mockup rendered, 2026-09-17

Rendered headless at 1280x720 and measured. All ten frames draw. Screenshots are
tracked under `docs/references/shots/`.

**The first render broke three capacity numbers, each at a figure
`docs/DESIGN.md` called safe.** That made the capacity table wrong, not the
specimen content unlucky.

| Frame | Was stated | What actually happened |
|---|---|---|
| 5 `references` | "six entries, the stated capacity" | Entry 3's title and URL collided with the footer; "2024." overprinted the logo. The old per-entry estimate of 115px underestimated every real entry (measured 123px at two lines, 168px at three) |
| 8 default content | "five bullets at the capacity limit" | Six rendered lines ended at 618px against a 624px floor — 6px of clearance, and the `==highlight==` underline crossed into the footer band |
| 9 code | "seven lines, the stated maximum" | The block clipped 29px horizontally: `scrollWidth` 1069 against `clientWidth` 1040. **Width was missing from the table entirely**, and line 2 at 57 characters was the overrun |

**All three are fixed and re-measured.** `docs/DESIGN.md`'s capacity table now
carries measured numbers, marks every remaining row as *derived*, and states the
rule the failures share: **entries and bullets are the wrong unit, lines are the
right one.** Every number that broke did so because one item wrapped.

Re-render after the corrections: **all ten frames clean** — no footer collision,
no clipping, nothing off-canvas.

The measurement that matters is not the obvious one. Slides are exactly 1280x720
with `scrollHeight` equal to `clientHeight`, so nothing spills off-canvas and a
check against the slide box reports clean. The collision is with the footer
region, which begins at **624px**.

**This could not have been found any other way.** The agent that wrote the spec
had no browser and said so; the numbers were arithmetic on region heights and had
never been drawn.

## Still open before this can be signed

**The display face is absent.** Computed font resolves to `Archivo, "Helvetica
Neue", Helvetica, "Liberation Sans", Arial, sans-serif` — Archivo is not in the
repo, so every frame is the fallback. Judge the type only after *Open question 1*
is settled and the `woff2` lands.

**Question 1 is unanswered.** These are specimen frames. No real past talk has
been poured into them, so "where did the template fight the content" is untested.
The three defects above are the argument for doing that before signing, not after
— they were found with contrived content that was *designed* to sit at capacity.
Real content wanders further.

## Sign-off

- [ ] Mockup reviewed full-screen at 1280×720 on: `____________________` (date)
- [ ] Real past deck used for the review: `____________________`
- [ ] All seven section types verified, including absent-field behaviour
- [ ] `docs/DESIGN.md` Provisional banner removed
- [ ] Template approved by: `____________________` (Date: `__________`)

Outcome / conditions attached to the approval:

```
____________________________________________________________
____________________________________________________________
```

**Blocks:** Phase 1b
