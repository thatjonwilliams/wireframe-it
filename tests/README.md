# Tests

Run these after any edit to `assets/`. They take about a minute.

## What the fixture is

`fixture/index.html` is a deliberately sloppy prototype, built to look like what Lovable, v0 and Bolt actually emit rather than like a clean test case. It carries, on purpose:

| | |
|---|---|
| Two display typefaces | Georgia body, Palatino brand |
| A variable-font axis | `font-variation-settings: 'wght' 380` |
| Six font weights | 300 through 800 |
| Design tokens | a `:root` block in the shadcn naming convention |
| Hardcoded class colours | `.sidebar`, `.badge.ok/.warn/.bad`, `.avatar` |
| Inline style colours | the three stat numbers |
| Tailwind-style utilities | `bg-violet-600`, `font-semibold`, written into the markup |
| A dark chromatic container | the indigo sidebar — the rule 1 vs rule 2 collision |
| A CSS gradient | the hero, with no `<img>` to catch |
| A tinted box-shadow | `rgba(124,58,237,.14)` on the cards |
| Inline SVG | `fill` and `stroke` attributes |
| Meaning carried by colour alone | green/amber/red status badges |
| An emoji | 🎉 — uncatchable, and the test documents that |
| A web component | `<ledger-widget>`, with a **shadow root** containing its own font, background and button |

The assets are symlinked into `fixture/`, so the fixture always exercises the current files rather than a stale copy.

## Running

```bash
python3 -m http.server 8777 --directory ~/.claude/skills/wireframe-review/tests/fixture
```

Open `http://localhost:8777`, then in the console:

```js
await wfSelfTest()
```

Fifteen assertions, printed as a table. The bar is all pass.

From a Claude Code session with the browser tools, the same thing in one call:

```js
const r = await wfSelfTest(); JSON.stringify(r.results.map(x => `${x.pass ? 'PASS' : 'FAIL'} ${x.test} ${x.detail}`))
```

If you are in a project whose `.claude/launch.json` you do not mind editing, a `wireframe-fixture` entry
pointing `python3 -m http.server` at `--directory <this folder>` lets `preview_start` open it directly.
Worth adding to a scratch project rather than to client work, where it would show up in the diff.

## What the assertions cover

| Assertion | Catches |
|---|---|
| wireframe mode changes the page | the stylesheet not loading at all |
| rule 4 — nothing reflows vertically (≤2px) | a change that makes text wrap differently |
| rule 4 — document height holds (≤4px) | the same, at page scale |
| rules 1, 1b, 2, 3, 5, 7 — zero violations | any override that stops matching |
| only one corner radius renders, and it is zero | a radius surviving in a shadow root or utility class |
| rule 7 — WCAG AA contrast | the wireframe becoming unreadable and confounding the session |
| exactly one non-grey colour renders | a second blue arriving as a hover, on-dark, tint or runtime-derived shade |
| exactly one typeface renders | a font leak, including from a shadow root |
| at most two weights render | a weight leak, including a variable-font axis |
| reverts exactly | the non-destructive promise, which is the one made to the founder |
| no leftover markers | the neutraliser failing to clean up after itself |

## Why these numbers, and not byte-identity

Rule 4 originally asserted byte-identical geometry and **failed**. That was a bug in the test, not in the skill: rule 3 replaces the typeface, and a typeface has metrics. Swapping Georgia for Helvetica narrows this fixture's `h1` text box by 11px while moving nothing vertically by more than 1px.

Horizontal text-box width is invisible to a reviewer. A line wrapping where it did not before is not — it changes the page being judged. So the test holds vertical position and document height, and allows horizontal reflow.

## The other measurement worth keeping

Before rule 7 existed, the wireframe **failed WCAG AA in nine places on this fixture** — a secondary button at 1.4:1, sidebar navigation at 2.2:1, and three more that missed 4.5 by a hundredth. The contrast pass takes it to zero.

Two regressions were caught here and are worth knowing about, because both were silent:

- Solving for the exact contrast ratio and rounding to an integer sRGB channel lands *just* under the target. Three elements came out at 4.49 against 4.5 — fine to the eye, failing to an auditor. The solver now verifies after rounding and steps until it genuinely clears.
- A blue derived to clear a contrast threshold is not one of the stylesheet's blues, so the next neutralise pass greyed it, and the contrast pass was then satisfied because grey-on-light passes contrast perfectly well. The affordance disappeared on the next DOM change. This was first patched with a `data-wf-blue` attribute; the derivation was then removed altogether, since the derived shades were themselves the "multiple blues" problem. The blue is now a constant and contrast is reached by moving the grey.
- Lifting dark containers replaced an earlier remedy that inverted every link on a dark surface into a blue chip. It passed all fifteen assertions and looked absurd: the entire sidebar became a blue slab in which every item appeared selected. Assertions do not see that, which is why the fixture is worth looking at as well as measuring.

## The measurement worth keeping

On this fixture, `wireframe.css` **alone** leaves 72 rule-1 violations on one screen while passing rule 3 completely. Adding `wireframe-neutralise.js` takes it to zero.

That number is the argument for why the neutraliser is not optional, and it is quoted in `SKILL.md` step 2. If a future change alters it, update it there too.

## Not covered

No fixture yet for: a routed SPA (the neutraliser's `MutationObserver` path), a canvas chart, a closed-mode shadow root, dark mode, or mobile breakpoints. Each of those is a real gap rather than an oversight — worth a second fixture when one of them bites.
