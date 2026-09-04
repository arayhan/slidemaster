# Accessibility

Not a polish pass. Every rule below is checkable while the component is being
written, and every one of them is cheaper now than after the markup is nested
three levels deeper.

## Semantics before ARIA

The first question is always "is there an element that already means this?" A
`<button>` is focusable, keyboard-activatable, and announced as a button for free.
A `<div onClick>` is none of those and needs four attributes plus a key handler to
catch up — and it will still be wrong on some device nobody tested.

- Anything that navigates is an `<a href>`. Anything that acts is a `<button>`.
- Every page has one `<h1>`, and heading levels never skip.
- Landmarks wrap the page: `<header>`, `<nav>`, `<main>`, `<footer>`. Exactly one
  `<main>`.
- A list of things is a `<ul>`.

**ARIA is the fallback, not the tool.** An incorrect `role` is worse than no role,
because it overrides what the element actually is.

## Keyboard

Every interactive element is reachable and operable with a keyboard alone. Tab
through the page you just built — this takes fifteen seconds and catches most of
what an audit would find.

- Focus is **visible**. Never `outline: none` without a replacement; style
  `:focus-visible` instead.
- Tab order follows reading order. If you need `tabindex` above 0, the DOM order
  is wrong.
- A modal traps focus while open and returns it to whatever opened it on close.
- Escape closes anything that opened on top of the page.
- A skip link is the first focusable element on the page.

## Visible and legible

- Text contrast at least **4.5:1** against its background; large text and UI
  borders at least **3:1**.
- Colour is never the only signal. An error is red *and* says what is wrong.
- Nothing breaks or scrolls sideways at 320px wide, or at 200% browser zoom.
- Touch targets at least 44×44px.

## Motion

Every transition, parallax, or auto-playing animation respects
`prefers-reduced-motion: reduce`. For some people this is not a preference — motion
triggers nausea and migraine.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Nothing flashes more than three times per second, ever.

## Forms

- Every input has a `<label>` tied to it. A placeholder is not a label — it
  disappears exactly when the user needs it.
- Errors are associated with their field (`aria-describedby`), announced, and say
  how to fix the problem rather than that one exists.
- Required fields are marked in text, not only with a red asterisk.

## Images and media

- Meaningful images get `alt` text describing what they convey. Decorative images
  get `alt=""` — not a missing attribute, which makes a screen reader read the
  filename.
- Icon-only buttons carry an accessible name.
- Video has captions.

## Enforcement

Lint catches the mechanical half — missing `alt`, a click handler on a non-
interactive element, an anchor with no `href`. It cannot check contrast, focus
order, or whether your `alt` text is meaningful. Those are read by a person, and
that person is the reviewer.

TODO(content) — record here once `eslint-plugin-jsx-a11y` is wired at `error`
severity, so a violation fails the build rather than printing a warning nobody
reads.

## This project's requirements

TODO(content) — any conformance target the engagement commits to (WCAG 2.2 AA is
the usual one), assistive technology that must be tested against, and any surface
with a stricter bar than the rest.
