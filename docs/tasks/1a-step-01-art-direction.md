# 1a-step-01-art-direction

Decide the visual direction for both surfaces, and settle every token value, before any
section anatomy is specified or any pipeline code is written.

> **Status: done.** The work below was completed by `ui-designer` in the 1a design pass.
> The acceptance criteria are therefore **verification**, not a to-do list — run them to
> confirm the artefacts still agree with each other. Residual items that are genuinely
> outstanding are listed under *Not done here* and each names an owner.

## Goal

Two surfaces exist in this product and they are not the same design problem: the **slide
template** (the product, a Marp theme at 1280×720) and the **app chrome** (the frame
around it). Establish one direction for each, one token namespace for each, and the
reasoning that makes a future screen either conform or knowingly break.

Direction is recorded **before** components, because a token set invented bottom-up from
whatever the first screen needed is how a palette ends up with nine greys and no reason
for any of them.

## Deliverables

- `docs/DESIGN.md` — rewritten, covering both surfaces, **Provisional** banner removed:
  - the surface table (surface, mode, token namespace, where its CSS lives)
  - the slide template's thesis, the use scene that forces it, the colour strategy, the
    accent's two jobs, and the motion budget
  - canvas, safe area, content box, foot band, and the 8-column grid, with the capacity
    arithmetic shown
  - a slide-specific type scale with the derivation of its 40px floor
  - the three type families, each with the reason no other face satisfies its job
  - the app chrome's direction, component list, `/decks`, `/edit/:id`, `/present/:id`,
    the present keyboard map, and the responsive table
  - a stated reason the two token sets are namespaced apart rather than shared
  - an **Open questions for the gate** section for anything still the owner's call
- `src/theme/slide-tokens.css` — the `--slide-*` layer. Plain CSS, created outside the
  Tailwind pipeline because a Tailwind class on a slide element does nothing and throws
  nothing (`docs/rules/ui-styling.md`).
- `src/styles/tokens.css` — rewritten as the `--chrome-*` layer only. The generator's
  starter values are gone.

## Acceptance Criteria

Run from the repo root. Each block is a command plus the output that means it passed.

**1 — the Provisional banner is gone.**

```bash
rg "Provisional" docs/DESIGN.md
```
Passes when there are **no matches** (rg exits 1).

**2 — both surfaces are covered, and the token namespaces do not leak into each other.**

```bash
rg -c "^## Direction — the slide template" docs/DESIGN.md   # expect 1
rg -c "^## Direction — the app chrome" docs/DESIGN.md       # expect 1
rg "^\s*--slide-" src/styles/tokens.css                     # expect NO matches
rg "^\s*--chrome-" src/theme/slide-tokens.css               # expect NO matches
```

**3 — every `--slide-*` token in the CSS appears in the DESIGN.md table with the same
value, and vice versa.** This is the check that keeps the table authoritative.

```bash
node -e "const fs=require('fs');const n=s=>s.trim().replace(/\s+/g,' ');const css=[...fs.readFileSync('src/theme/slide-tokens.css','utf8').matchAll(/(--slide-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(m=>m[1]+' = '+n(m[2]));const doc=[...fs.readFileSync('docs/DESIGN.md','utf8').matchAll(/\|\s*\x60(--slide-[a-z0-9-]+)\x60\s*\|\s*\x60([^\x60]+)\x60/g)].map(m=>m[1]+' = '+n(m[2]));const A=new Set(css),B=new Set(doc);const miss=[...A].filter(v=>!B.has(v)),extra=[...B].filter(v=>!A.has(v));if(miss.length||extra.length){console.log('in CSS, missing from DESIGN.md:',miss);console.log('in DESIGN.md, missing from CSS:',extra);process.exit(1)}console.log('OK -',A.size,'slide tokens agree')"
```
Passes when it prints `OK - <n> slide tokens agree` and exits 0.

**4 — the same check for the chrome layer.**

```bash
node -e "const fs=require('fs');const n=s=>s.trim().replace(/\s+/g,' ');const css=[...fs.readFileSync('src/styles/tokens.css','utf8').matchAll(/(--chrome-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(m=>m[1]+' = '+n(m[2]));const doc=[...fs.readFileSync('docs/DESIGN.md','utf8').matchAll(/\|\s*\x60(--chrome-[a-z0-9-]+)\x60\s*\|\s*\x60([^\x60]+)\x60/g)].map(m=>m[1]+' = '+n(m[2]));const A=new Set(css),B=new Set(doc);const miss=[...A].filter(v=>!B.has(v)),extra=[...B].filter(v=>!A.has(v));if(miss.length||extra.length){console.log('in CSS, missing from DESIGN.md:',miss);console.log('in DESIGN.md, missing from CSS:',extra);process.exit(1)}console.log('OK -',A.size,'chrome tokens agree')"
```
Passes when it prints `OK - <n> chrome tokens agree` and exits 0.

**5 — every text/ground pair in the slide palette clears 4.5:1.** Computed from the token
file, so it fails the moment someone nudges a hex.

```bash
node -e "const fs=require('fs');const t=Object.fromEntries([...fs.readFileSync('src/theme/slide-tokens.css','utf8').matchAll(/(--slide-[a-z0-9-]+)\s*:\s*(#[0-9A-Fa-f]{6})/g)].map(m=>[m[1],m[2]]));const L=h=>{const c=[1,3,5].map(i=>parseInt(h.substr(i,2),16)/255).map(v=>v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4));return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};const R=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};const P=[['--slide-on-paper','--slide-ground-paper'],['--slide-on-paper-muted','--slide-ground-paper'],['--slide-on-paper-accent','--slide-ground-paper'],['--slide-on-field','--slide-ground-field'],['--slide-on-field-muted','--slide-ground-field'],['--slide-on-ink','--slide-ground-ink'],['--slide-on-ink-muted','--slide-ground-ink'],['--slide-on-ink-accent','--slide-ground-ink'],['--slide-code-string','--slide-surface'],['--slide-code-literal','--slide-surface'],['--slide-on-paper','--slide-surface']];let bad=0;for(const p of P){const r=R(t[p[0]],t[p[1]]);const ok=r>=4.5;if(!ok)bad++;console.log((ok?'PASS':'FAIL'),p[0],'on',p[1],r.toFixed(2)+':1')}process.exit(bad?1:0)"
```
Passes when every line reads `PASS` and it exits 0.

**6 — the chrome palette clears its thresholds**, including the two that are easy to get
wrong: `--chrome-border` must reach 3:1 as a perceivable boundary, and
`--chrome-focus-on-scrim` must reach 3:1 against the present-bar ground.

```bash
node -e "const fs=require('fs');const t=Object.fromEntries([...fs.readFileSync('src/styles/tokens.css','utf8').matchAll(/(--chrome-[a-z0-9-]+)\s*:\s*(#[0-9A-Fa-f]{6})/g)].map(m=>[m[1],m[2]]));const L=h=>{const c=[1,3,5].map(i=>parseInt(h.substr(i,2),16)/255).map(v=>v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4));return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};const R=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};const P=[['--chrome-fg','--chrome-bg',4.5],['--chrome-fg-muted','--chrome-bg',4.5],['--chrome-accent','--chrome-bg',4.5],['--chrome-fg-on-accent','--chrome-accent',4.5],['--chrome-fg-on-scrim','--chrome-scrim',4.5],['--chrome-border','--chrome-bg',3],['--chrome-focus','--chrome-bg',3],['--chrome-focus-on-scrim','--chrome-scrim',3]];let bad=0;for(const p of P){const r=R(t[p[0]],t[p[1]]);const ok=r>=p[2];if(!ok)bad++;console.log((ok?'PASS':'FAIL'),p[0],'on',p[1],r.toFixed(2)+':1','min',p[2])}process.exit(bad?1:0)"
```
Passes when every line reads `PASS` and it exits 0.

**7 — the type scale's reasoning is recorded, not just its numbers.** A scale without its
derivation is a preference, and a preference does not survive the third deck.

```bash
rg -c "the slide body floor is 40px" docs/DESIGN.md   # expect 1
rg -c "Nothing below 40px carries information" docs/DESIGN.md   # expect 1
```

**8 — one spacing system per surface, and nothing in between.**

```bash
node -e "const fs=require('fs');const c=fs.readFileSync('src/theme/slide-tokens.css','utf8');const s=[...c.matchAll(/--slide-space-([0-9]+)\s*:\s*([0-9]+)px/g)].map(m=>Number(m[2]));const want=[8,16,24,40,64,96,128];const ok=JSON.stringify(s)===JSON.stringify(want);console.log(ok?'OK slide steps':'MISMATCH',s);process.exit(ok?0:1)"
node -e "const fs=require('fs');const c=fs.readFileSync('src/styles/tokens.css','utf8');const s=[...c.matchAll(/--chrome-space-([0-9]+)\s*:\s*([0-9]+)px/g)].map(m=>Number(m[2]));const want=[4,8,16,24,40,64];const ok=JSON.stringify(s)===JSON.stringify(want);console.log(ok?'OK chrome steps':'MISMATCH',s);process.exit(ok?0:1)"
```

**9 — the present-mode keyboard map is specified**, because it is the one hard functional
requirement in `docs/rules/accessibility.md` and it is tested in 1b.

```bash
rg -c "PageDown" docs/DESIGN.md   # expect 1
rg -c "toggle fullscreen" docs/DESIGN.md   # expect 1
rg -c "exit present mode" docs/DESIGN.md   # expect 1
```

### What could not be written as a check

Stated plainly rather than dressed up as a criterion:

- **Whether the direction is any good.** No command answers that. It is the whole point of
  `1a-gate-template`, and it needs a human looking at the mockup on a screen.
- **Whether the type is legible from the back of a room.** The 40px floor is derived from
  two converging calculations, but the only real test is a projector and a room. The gate
  asks for it; a grep cannot.
- **Whether the accent carries meaning consistently.** The rule is written down
  (structure, and author-marked emphasis, and nothing else). Enforcing it needs a reviewer
  reading the theme CSS in 1b, not a pattern.

## Not done here

| Item | Why not | Owner |
|---|---|---|
| The Archivo `woff2` files under `public/fonts/` | Gated on *Open question 1* in `docs/DESIGN.md`. The token stack degrades to the platform grotesk until then, and the mockup currently shows that fallback | `software-engineer`, after the gate |
| The Marp theme CSS itself | Phase 1b, and gated. 1a produces the spec, not the implementation | `software-engineer` |
| Tailwind config wiring `--chrome-*` into the utility layer | Phase 1b. `docs/rules/ui-styling.md` requires the config to be the token source | `software-engineer` |

## Finding to hand off

`src/styles.css:6` declares `color-scheme: light dark`. Phase 1 has no dark mode
(`docs/rules/ui-styling.md`: "No dark mode in Phase 1 … do not add a `dark:` variant or a
theme toggle now"), and that declaration makes the browser render form controls and
scrollbars dark on a dark-preferring OS while every token stays light. It should be
`color-scheme: light`. Reported rather than patched — `src/` is not this role's to edit.

**Depends:** — · **Blocks:** 1a-step-02-template-spec · **handoff:** ui-designer
