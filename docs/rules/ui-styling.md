# UI styling

**What the design system *is* — tokens, type scale, components, do's and don'ts —
lives in [DESIGN.md](../DESIGN.md).** This file is only how to write
the styles that implement it. When the two disagree, DESIGN.md wins and this file
is wrong.

## Tailwind

Utility classes in the markup are the default. Resist the urge to "clean up" a
long class list by extracting CSS — the length is the tradeoff you accepted, and
the alternative is a class name that hides what the element actually does.

**Extract a component, not a CSS class.** When the same class list appears a third
time, the answer is a React component that owns it. That gives you one place to
change it, props for the variants, and a name that means something.

**`@apply` is almost always the wrong answer.** It rebuilds the indirection
Tailwind removes: now there is a class name whose meaning lives in a stylesheet
you have to open, and the utility classes are still there, just hidden. Reach for
it only for a genuine third-party override you cannot reach any other way.

**The config is the token source.** Colors, spacing, radii, and type scale are
defined in the Tailwind config and used through it. An arbitrary value —
`text-[#3b82f6]`, `p-[13px]` — is a token that escaped, and it will not update
when the system does.

Order matters when classes conflict: Tailwind cannot resolve `p-2 p-4` by source
order, so merge conditional classes through a helper (`cn()` in `src/lib/`)
rather than string concatenation.

## Tokens

`tokens.css` is the source of truth for colour, spacing, radius and shadow. Every
value in a component reads a token.

**A raw hex, px, or rem in a component is a bug**, not a shortcut. It is the value
that does not change when the system does, and it is invisible until someone
notices one card is four pixels off.

Adding a token is a deliberate change to the system — it goes in `tokens.css` and
in DESIGN.md, not just wherever it was first needed.

## Responsive

Mobile-first: the base styles are the small screen, and breakpoints add. Test at
320px — narrower than any device you own, and where broken layouts surface first.

Nothing scrolls horizontally. A fixed width wider than the viewport is a bug even
when it looks fine on your monitor.

## Motion

Every transition respects `prefers-reduced-motion: reduce`. Animate `transform`
and `opacity`; animating `width`, `height`, `top` or `left` forces layout on every
frame. Details are in [accessibility.md](./accessibility.md).

## This project's conventions

TODO(content) — anything not already covered by DESIGN.md: a component library in
use and how far it may be customised, a dark-mode strategy, an icon convention.
Delete this section if DESIGN.md covers it all.
