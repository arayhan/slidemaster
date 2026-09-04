# SlideMaster — brand assets

What this project ships, what is still a placeholder, and what only you can
supply. Everything marked *placeholder* was generated from the project name so
that nothing references a missing file — a broken image reference fails silently,
and you usually find out when someone shares the link.

Replace them with `raygent assets set logo <file>`, or by overwriting the files
directly. Run `raygent assets check` to see the current state.

## Shipped, placeholder

| Asset | Path | What it is |
|---|---|---|
| Favicon | `public/icon.svg` | Monogram `SM` on `#73be2d`, linked from the document head. |
| Logo | `public/logo.svg` | Wordmark. Nothing imports it yet, so swapping it is safe. |

The colour and initials are derived from the project name, so regenerating gives
the same mark rather than a new random one.

## Not shipped — supply these yourself

| Asset | Size | Where it goes | Why it isn't generated |
|---|---|---|---|
| Social card | 1200×630 | `public/og.png` + a `<meta property="og:image">` | No `next/og` outside Next, and X/Facebook do not accept SVG cards. **Add the meta tag only once the file exists** — a tag pointing at a missing image is worse than no tag. |
| Apple touch icon | 180×180 | `public/apple-touch-icon.png` | Must be a raster. |
| PWA icons | 192×192, 512×512 | `public/` + a web manifest | Only needed if this ships as an installable app. |

A single 1024×1024 source image is enough to produce all of the above.

## Rules

- **Never reference an asset that does not exist.** That is the one failure here
  that is invisible in development and only shows up in a share preview or a
  browser tab.
- Keep the favicon legible at 16×16. A full wordmark shrinks into mud; the
  monogram is the placeholder for that reason.
- Prefer SVG wherever the consumer accepts it. The exceptions above are the
  places that genuinely require a raster.
- This file covers the brand set only. Where **general** assets go — imported vs
  URL-fetched, images vs media — is ruled in
  [docs/rules/code-style.md](rules/code-style.md), under "Where
  assets live".
