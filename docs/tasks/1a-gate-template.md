# 1a-gate-template

The one master template is the product. This gate is where a human looks at it on a
screen and says it is finished, before any render-pipeline code is written against it.

## Decision Maker

Human owner (the author — the only user of this tool).

## Unblocks

Phase 1b — the Marp render pipeline, theme CSS, routes, and SQLite index.

## Questions

Do not leave these unasked:

1. Does the static mockup render a **real** past presentation well — not a contrived demo deck? Where did the template fight the content?
2. Are all seven section types (title, profile, intermezzo, quote, references, contact, closing) shown, and does each one still read correctly when optional frontmatter fields are missing?
3. Is the type scale legible from the back of a room at 1280×720? Has it been checked at that size, not in a browser at 50%?
4. Is there any decision this template leaves to the deck author? Each one is a design decision per deck, which is the thing this product exists to remove.
5. Does the accent colour carry meaning consistently, or is it decoration?
6. Would you present this deck to the audience you actually present to?
7. What is explicitly **not** solved by this template, and is that acceptable until Phase 3 (layout modes) rather than a reason to redesign now?

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
