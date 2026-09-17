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

Rendered headless at 1280x720 and measured. All ten frames draw. Four screenshots
are tracked under `docs/references/shots/`.

**Three defects, and every one of them is at a capacity `docs/DESIGN.md` states as
safe.** That makes the capacity table wrong, not the content unlucky.

| Frame | Stated capacity | What happens |
|---|---|---|
| 5 `references` | "six entries, the stated capacity under a heading" | Entry 3's title and its URL **collide with the footer**. "2024." overprints the `halcyon` logo |
| 8 default content | "five bullets at the capacity limit" | The last bullet, "rebuild from empty", **collides with the footer** |
| 9 code | "seven lines, the stated maximum under a heading" | The code block overflows **29px horizontally** and clips: `scrollWidth` 1069 against `clientWidth` 1040. Line 4 loses its closing characters |

Measured, not eyeballed: slides are exactly 1280x720 with `scrollHeight` equal to
`clientHeight`, so nothing spills off-canvas — content collides with the footer
region instead, which is why a check against the slide box alone reports clean.

**This could not have been found any other way.** The agent that wrote the spec
had no browser and said so; the capacity numbers were derived arithmetically from
region heights and never rendered.

**The display face is still absent.** Computed font resolves to `Archivo,
"Helvetica Neue", Helvetica, "Liberation Sans", Arial, sans-serif` — Archivo is
not in the repo, so every frame above is the fallback. Judge the type only after
`Open question 1` is settled and the `woff2` lands.

**Question 1 is still unanswered.** These frames are specimen content. No real past
talk has been poured into them, so "where did the template fight the content"
remains untested — and the three defects above are the argument for doing it
before signing, not after.

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
