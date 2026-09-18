# Wireframe It

A Claude skill that resets a working prototype to a neutral greyscale wireframe — **Helvetica, two weights, one interaction blue, right angles, structure untouched** — so a team can review how a product *works* rather than how it looks.

The prototype keeps running. Every route, form, state and modal still functions, and a toggle in the corner switches back to the original design in one click. Nothing in the source is overwritten.

```
┌─────────────────────────────────────────┐
│  Colour      greyscale, #FAFAFA→#121212 │
│  Interaction #256BED, one value, clicks  │
│  Typeface    Helvetica, 400 and 700      │
│  Corners     right angles                │
│  Contrast    WCAG 2.2 AA, enforced       │
│  Everything  unchanged                   │
│  else                                    │
└─────────────────────────────────────────┘
```

## Why

A prototype built with AI tools arrives fully dressed. It has a colour scheme, a typeface, gradients, an accent — and almost none of it was decided. It came from the model's defaults, from "make it clean and modern", or from pointing at another product and saying "like that".

That creates a specific problem in review. Everyone in the room can see the colour, so everyone comments on the colour. Meanwhile the things that decide whether the product works — what is on screen, in what order, grouped how, leading where — go unexamined.

Two things happen when you take the styling away:

- **The interactive surface becomes a shape.** With one colour left, every clickable thing lights up at once. Teams routinely discover a screen with nineteen interactive elements and no discernible primary action.
- **Colour doing load-bearing work becomes visible.** A status that can only be read as red is a comprehension and accessibility risk that a styled review will never surface.

There is a second use, and for a team about to commission real design work it is the larger one: the reset is a **blank slate with the structure still intact**. Layout, flow, states and copy survive; every arbitrary visual decision is gone. That is exactly the boundary a design system wants to attach to.

## Install

**Claude Code** — clone into your skills directory:

```bash
git clone https://github.com/thatjonwilliams/wireframe-it.git ~/.claude/skills/wireframe-it
```

It is picked up on the next session. No restart needed.

**Claude desktop app** — download the repo as a ZIP and import it through Settings → Skills.

Then just ask, in any project:

> wireframe this prototype

## What it does

1. **Finds where colour is decided** — design tokens, Tailwind utilities, hardcoded hex, or a component library theme. `assets/harvest.js` is a console snippet that reports what a running page is actually made of, so this works even when the prototype lives inside Lovable or v0 and has never been exported.
2. **Adds a theme layer** (`assets/wireframe.css`) scoped to a single class on `<html>`, plus a **neutraliser** (`assets/wireframe-neutralise.js`) that maps each computed colour to the grey of equivalent luminance, crosses shadow roots, and reverts cleanly.
3. **Adds a toggle** (`assets/wireframe-toggle.js`) — a small control that flips between the two states without a reload, so a stakeholder mid-task can check they are on the same screen and flip back.
4. **Verifies the result** (`assets/verify.js`) against the specification, per rule, on every screen. The bar is zero violations.
5. **Reports what the wireframe showed** — which is the part that produces the value.

`references/review-protocol.md` is a facilitator's guide you can paste into a doc and hand to whoever is running the session.

## Accessibility

The wireframe itself meets **WCAG 2.2 AA** — 4.5:1 for body text, 3:1 for large text and control boundaries — and this is enforced by the neutraliser rather than left to chance.

This is not decoration. If the wireframe is hard to read, every hesitation in a review becomes ambiguous: the participant may have stalled on the structure, or because they could not see the text. The finding is lost either way.

Getting there with a single accent takes some care. No colour clears 4.5:1 as *text* on both `#FAFAFA` and `#121212` — that window is arithmetically empty, which is why so many systems end up with three or four blues. It closes once the affordance is allowed to change form:

| Context | Form | |
|---|---|---|
| Light surface | blue text | 4.57:1 |
| Element owning a dark surface | blue surface, `#FAFAFA` label | 4.57:1 |
| That chip against `#121212` | boundary | 3.93:1 |

One value covers all three, because blue text on off-white and an off-white label on blue have the identical contrast requirement. **The blue is a constant; the grey moves.**

## Tests

There is a fixture built to look like what Lovable, v0 and Bolt actually emit — two display typefaces, a variable-font axis, six weights, hardcoded hex, Tailwind-style utilities, a dark sidebar, a gradient, a tinted shadow, status colour with no text fallback, an emoji, and a web component with its own shadow root.

```bash
python3 -m http.server 8000 --directory .
```

Open `http://localhost:8000/tests/fixture/` and run in the console:

```js
await wfSelfTest()
```

Sixteen assertions. The bar is all pass. See [tests/README.md](tests/README.md) for what each one catches and why the numbers are what they are.

Measured on that fixture, the stylesheet alone leaves **72 rule-1 violations on one screen**; with the neutraliser, zero.

## When not to use it

- The prototype is a marketing page or brand piece where the visual treatment *is* the product.
- The visual language was deliberately researched and agreed, and the question on the table is a specific one about that language.
- The prototype is too early to have structure worth testing. Three screens of placeholder text will not tell you anything.

## Licence

[CC0 1.0 Universal](LICENSE) — public-domain dedication. No rights reserved; use it freely, no attribution required. A star or a credit is always appreciated.

---

Method developed at [Man Made](https://manmade.com), a product design practice working with founders taking AI-built products to market.
