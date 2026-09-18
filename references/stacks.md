# Applying the theme layer, by stack

The principle is the same everywhere: add a scoped override, never a replacement. If the change cannot be undone by removing one class from `<html>`, it is the wrong change.

Read only the section that matches the prototype.

---

## Contents

1. [CSS custom properties](#1-css-custom-properties)
2. [Tailwind](#2-tailwind)
3. [Hardcoded hex values](#3-hardcoded-hex-values)
4. [Component libraries](#4-component-libraries)
5. [Charts and canvas](#5-charts-and-canvas)
6. [Tool-specific notes: Lovable, Replit, v0, Bolt](#6-tool-specific-notes)
7. [Finding the leaks](#7-finding-the-leaks)

---

## 1. CSS custom properties

The good case. The prototype defines colour once and every component reads from it.

Find the definitions (usually `:root` in `index.css`, `globals.css` or `app.css`), then redefine the same names inside the wireframe scope. Section 2 of `wireframe.css` already covers the shadcn/ui naming convention. Add anything else the project uses:

```css
html.wireframe-mode {
  --brand-500: var(--wf-interactive);
  --surface-raised: var(--wf-1);
  --text-secondary: var(--wf-6);
}
```

Order matters: the wireframe sheet must be imported after the sheet that defines the originals, or the specificity tie goes the wrong way.

Dark mode: if the project has a `.dark` class, add `html.wireframe-mode.dark` overrides too, or simply force light by removing `.dark` while wireframe mode is on. Reviewing two variables at once defeats the purpose.

---

## 2. Tailwind

### Tailwind v3

Utilities are compiled to real classes, so a scoped sheet loaded after Tailwind's output wins on specificity without needing to touch markup. Import `assets/wireframe-tailwind.css` after `wireframe.css`; it covers the standard palette families across three tonal bands. Extend it for any custom colours in `tailwind.config.js`:

```css
html.wireframe-mode [class*="bg-brand"] { background-color: var(--wf-2) !important; }
html.wireframe-mode [class*="text-brand"] { color: var(--wf-7) !important; }
```

Check `theme.extend.colors` in the config for the full list of custom names. Those are the ones that will otherwise leak.

### Tailwind v4

Colours are custom properties (`--color-blue-500`), which makes this easier. Override them directly:

```css
html.wireframe-mode {
  --color-blue-500: var(--wf-2);
  --color-emerald-500: var(--wf-2);
  /* and so on for every family in use */
}
```

Prefer this to the attribute-selector approach when v4 is in play; it is cleaner and faster.

### Arbitrary values

`bg-[#7C3AED]` compiles to a class containing the hex. The wildcard selectors will not catch it. Grep for `-\[#` and handle those cases explicitly, or add:

```css
html.wireframe-mode [class*="bg-["] { background-color: var(--wf-2) !important; }
html.wireframe-mode [class*="text-["] { color: var(--wf-7) !important; }
```

Be careful with the second one: `text-[15px]` matches it too. Scope it to values containing `#` if the project mixes both.

---

## 3. Hardcoded hex values

The messy case, and the one worth reporting back on. Colour is written literally into component files, inline `style` props and one-off CSS.

Do not find-and-replace. It is destructive, it will miss the cases you cannot see, and it cannot be toggled.

Instead:

1. Inventory first. `grep -rEo '#[0-9a-fA-F]{3,8}\b' src/ | sort | uniq -c | sort -rn` gives you the real palette, ranked by use. The length of that list is the finding: a prototype with sixty distinct hex values does not have a design system, it has a history of decisions nobody wrote down.
2. Promote the top values to custom properties in the prototype's own stylesheet, replacing the literals with `var(--x)` as you go. This is a genuine improvement to the codebase and it survives the exercise.
3. Override those properties in the wireframe scope as in section 1.

If time is short, an interim measure: a greyscale filter on the app root with the toggle chrome excluded.

```css
html.wireframe-mode body > *:not([data-wf-chrome]) { filter: grayscale(1); }
```

This is blunt. It also greys the interaction blue, so you lose rule 2 and with it the most useful part of the exercise. Use it only to show someone what the exercise looks like, then do it properly.

---

## 4. Component libraries

**shadcn/ui** — components live in the project and read from the standard custom properties already covered in `wireframe.css` section 2. Usually nothing more is needed. Check `components/ui/button.tsx` for variant classes that hardcode colour.

**MUI** — wrap the app in a second `ThemeProvider` whose palette is the grey ramp, switched by the same state that drives the class. MUI's `sx` and `styled` values will not respond to CSS overrides reliably.

**Chakra** — same approach: a second theme object, swapped at the provider.

**Mantine, Ant Design** — both expose CSS variables; override in the wireframe scope as in section 1.

For any provider-based library, drive the toggle from React state and set both the theme object and the `<html>` class from it, so the CSS layer and the JS theme stay in step.

---

## 5. Charts and canvas

Chart libraries take colours as JavaScript values. CSS cannot reach them, and they are the most common survivor.

Recharts, Chart.js, Nivo, Visx, D3: find the colour arrays and swap them for a greyscale series when wireframe mode is on.

```js
const WIREFRAME_SERIES = ['#131316', '#4a4a51', '#6e6e76', '#9a9aa0', '#c2c2c6', '#dcdcde'];
const series = wireframeMode ? WIREFRAME_SERIES : BRAND_SERIES;
```

Order the greys so adjacent series stay distinguishable. If a chart becomes unreadable in greyscale, that is a finding worth reporting: it means the chart depends on hue alone to separate its series, which fails for a meaningful share of readers in the styled version too.

---

## 6. Tool-specific notes

**Lovable** — add the CSS file and import it in `index.css`. Mount the React toggle in `App.tsx`. Ask Lovable for both in one instruction; it handles global stylesheet additions well. Do not ask it to "make the app greyscale", which it will interpret as a redesign and rewrite components.

**Replit** — same as any Vite or Next project. If the prototype is a single HTML file, the script tag and a `<link>` are enough.

**v0** — generated components are Tailwind and shadcn, so sections 2 and 4 apply directly. Colours often appear as arbitrary values, so check for `-[#`.

**Bolt** — as Replit.

In all four, phrase the instruction as adding two files and one import. The tools are good at additive changes and unreliable at sweeping edits, and an additive change is what keeps this reversible.

---

## 7. Finding the leaks

Turn wireframe mode on and run this in the console. It reports every element painting a colour that is neither grey nor the interaction blue.

```js
(() => {
  // Pulls every colour out of a value, so multi-colour properties
  // (box-shadow, background-image gradients) are checked in full.
  const COLOURS = /rgba?\(([^)]+)\)/g;
  const isGrey = str => {
    const parts = str.split(/[\s,\/]+/).filter(s => s !== '').map(parseFloat);
    const [r, g, b, a] = parts;
    if ([r, g, b].some(Number.isNaN)) return true;
    if (a !== undefined && a < 0.04) return true;          // effectively invisible
    return Math.max(r, g, b) - Math.min(r, g, b) < 12;
  };
  const BLUE = [[37, 99, 235], [29, 78, 216], [147, 180, 251], [239, 244, 254]];
  const isBlue = str => {
    const [r, g, b] = str.split(/[\s,\/]+/).filter(s => s !== '').map(parseFloat);
    return BLUE.some(c => Math.abs(c[0] - r) < 10 && Math.abs(c[1] - g) < 10 && Math.abs(c[2] - b) < 10);
  };

  // The seven usual survivors from step 4, not just the obvious three.
  const PROPS = ['color', 'backgroundColor', 'backgroundImage', 'borderTopColor',
                 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
                 'outlineColor', 'textDecorationColor', 'accentColor',
                 'boxShadow', 'fill', 'stroke', 'caretColor'];

  const hits = [];
  document.querySelectorAll('*').forEach(el => {
    if (el.closest('[data-wf-chrome]')) return;
    const s = getComputedStyle(el);
    PROPS.forEach(p => {
      const v = s[p];
      if (!v || v === 'none') return;
      for (const m of v.matchAll(COLOURS)) {
        if (!isGrey(m[1]) && !isBlue(m[1])) {
          hits.push({ prop: p, value: m[0], tag: el.tagName.toLowerCase(),
                      cls: String(el.className).slice(0, 48), el });
          break;
        }
      }
    });
  });

  console.table(hits.slice(0, 120).map(({ el, ...r }) => r));
  console.log(hits.length + ' leaks');
  hits.slice(0, 40).forEach(h => h.el.style.outline = '2px dashed magenta');
  return hits;
})();
```

It outlines the first forty in magenta so you can see where they are on the page. Run it on every main screen, not just the first: leaks cluster in the screens nobody demoed.

Two things it cannot see, so check them by eye. Emoji are full-colour glyphs and no CSS colour property describes them. And anything drawn into a `<canvas>` is a bitmap, not styled elements, so section 5 is the only route there.

---

## 8. Shadow DOM

The hole that no amount of section 8 CSS closes, and the one most likely to be missed, because the component keeps working and simply keeps its own styling.

A stylesheet scoped to `html.wireframe-mode` **cannot match inside a shadow root**. Within that tree scope `html` is not an ancestor, so every rule misses and the component renders exactly as it always did. Nothing warns you. On a page where most of the interface is light DOM, a single untouched widget reads as an oversight rather than a boundary.

Anything built on Lit, Stencil or Shoelace is affected, as are most design-system web components and a good deal of embedded third-party UI.

`assets/wireframe-neutralise.js` handles this. It walks shadow roots alongside the light DOM, and adopts a copy of the wireframe sheet into each one with the scope prefix stripped.

Two details in that rewrite are worth knowing, because both fail silently:

- **The prefix is stripped from descendant selectors and replaced with `:host` on the bare one.** `html.wireframe-mode, html.wireframe-mode *` is the selector list carrying the whole typography spec. Strip it blindly and the first item becomes empty, the selector list becomes invalid, and the browser drops the entire rule — so the shadow root keeps its original typeface while everything else conforms.
- **Roots under `[data-wf-chrome]` are excluded.** The toggle mounts its own control in a shadow root precisely so the theme layer cannot reach it. Adopting into every root indiscriminately reaches past that and repaints the review chrome in the product's wireframe styling, which is the confusion the shadow root existed to prevent.

Closed-mode shadow roots (`attachShadow({mode:'closed'})`) are genuinely unreachable — `element.shadowRoot` returns null and there is no way in from outside. Rare in application code, occasional in third-party embeds. If `verify.js` reports a region it cannot see, or you can see colour that nothing flags, suspect a closed root and say so in the report rather than working around it.

Cross-origin iframes are unreachable for the same practical reason. Neither CSS nor script crosses that boundary. Report it.

---

## 9. Bundled apps, and auth middleware

Next, Nuxt, Vite, Remix — anything that ships CSS and JS as modules rather than as files in a public directory. Two traps, both silent.

### Do not put the assets in `public/`

The obvious move is to drop `wireframe.css` and the scripts into `public/wireframe/` and reference them with a `<link>` and two `<script>` tags. On any app with auth middleware this fails, and it fails invisibly: the tags sit in the DOM, the requests are answered with a **307 to the login page**, nothing loads, and the page looks entirely normal.

The usual Next matcher is written to exclude images and nothing else:

```js
matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4)$).*)"]
```

`.css` and `.js` are not in that list, so the middleware swallows them. `/_next/static` **is** excluded — which is the answer. Import the assets through the bundler and they are served from a path the matcher already lets through, with no change to anyone's auth config:

```tsx
// app/layout.tsx
import "./globals.css";
import "@/wireframe/wireframe.css";
import { WireframeIt } from "@/wireframe/WireframeIt";
```

```tsx
// wireframe/WireframeIt.tsx
'use client';
import { useEffect } from 'react';

export function WireframeIt() {
  useEffect(() => {
    import('./wireframe-toggle.js');
    import('./wireframe-neutralise.js');
  }, []);
  return null;
}
```

### Import the scripts inside `useEffect`, not at module scope

Both scripts are IIFEs that touch `document` the moment they evaluate, and a `'use client'` component is still rendered on the server. A top-level import crashes the SSR pass. The dynamic import inside `useEffect` is what keeps them client-only.

### Getting the verifier in

`verify.js` is pasted into the console, so it needs to be reachable. Behind middleware it is not. The quickest way in without touching anyone's config is to exploit the matcher's own exclusion list — copy it to `public/wf-verify.svg` and fetch that:

```js
const src = await fetch('/wf-verify.svg').then(r => r.text());
eval(src);
```

`fetch().text()` does not care about the content type. Delete the file afterwards.

### Expect a stale module

Turbopack and Vite both cache dynamically imported modules aggressively. If a fix to the neutraliser appears to have no effect, confirm it is actually in the bundle before diagnosing anything else — restart the dev server and clear `.next` or `node_modules/.vite`. Two rounds of a real diagnosis were spent on a fix that was correct and simply not loaded.
