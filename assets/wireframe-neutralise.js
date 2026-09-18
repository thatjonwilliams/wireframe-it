/* ============================================================
   Wireframe Review — the neutraliser
   ------------------------------------------------------------
   Load this after wireframe.css and wireframe-toggle.js.

   WHY THIS EXISTS

   wireframe.css reaches colour two ways: by overriding design
   tokens (section 2) and by naming specific selectors (section
   8). Both work, and neither is general. A prototype that writes
   `background:#1e1b4b` into a class, or `style="color:#16a34a"`
   into the markup, is untouched by either — and that is most
   generated prototypes, because writing colour literally is what
   the models do.

   Measured on the fixture in tests/: the stylesheet alone leaves
   72 rule-1 violations on one screen. The typography spec passes
   completely; colour does not come close.

   So this file closes the gap in the one way CSS cannot. It reads
   each element's COMPUTED colour, converts it to the grey of
   equivalent luminance, and writes that back inline. Equivalent
   luminance rather than a flat grey is the whole point: rule 1
   asks for the prototype's contrast relationships to survive, and
   a wireframe with no tonal structure is as useless as one with
   too much colour.

   It is still non-destructive. Everything it writes is inline
   style on live DOM nodes, tracked and removed when wireframe
   mode goes off. Nothing in the project's source is touched.

   WHAT IT DELIBERATELY DOES NOT TOUCH

   The interaction blue, wherever it appears. Inline styles beat
   stylesheet rules even important ones, so a grey written here
   over a blue painted by wireframe.css section 4 would win, and
   the affordance would disappear — the one failure the exercise
   cannot tolerate. Skipping the blue by value rather than by
   element is what makes that safe: it does not matter which rule
   painted it or which element it landed on.
   ============================================================ */

(function () {
  'use strict';

  var CLASS = 'wireframe-mode';
  var MARK = 'data-wf-neutralised';

  /* Every property that can carry a colour, including the multi-colour
     ones. There is no per-property exception list and no special case
     for interactive elements: the interaction layer is protected by
     skipping the interaction blue itself, wherever it appears. See
     WF_BLUES below — that one rule replaced an ownership table that
     got `background-color` wrong on every interactive element with a
     chromatic surface (a nav item with an active state, most obviously,
     which section 4 does not paint because it is not a filled button). */
  var PROPS = [
    'color', 'background-color', 'background-image',
    'border-top-color', 'border-right-color',
    'border-bottom-color', 'border-left-color',
    'outline-color', 'fill', 'stroke', 'text-decoration-color',
    'caret-color', 'column-rule-color', 'box-shadow'
  ];

  /* The four values from wireframe.css section 4. A value already at one
     of these was painted by the interaction layer, so leaving it alone is
     what keeps rule 2 intact. Writing grey over it would be inline and
     important, which beats the stylesheet, and the affordance would
     vanish — the one failure the exercise cannot tolerate.

     A prototype whose own brand colour is exactly #2563EB survives here
     too. That is the right outcome: it is indistinguishable from the
     interaction blue on the screen, so it is indistinguishable to the
     reviewer as well. */
  var WF_BLUES = [[37, 99, 235], [29, 78, 216], [147, 180, 251], [239, 244, 254]];

  function isInteractionBlue(r, g, b) {
    for (var i = 0; i < WF_BLUES.length; i++) {
      var c = WF_BLUES[i];
      if (Math.abs(c[0] - r) < 6 && Math.abs(c[1] - g) < 6 && Math.abs(c[2] - b) < 6) return true;
    }
    return false;
  }

  /* ---------- colour maths ----------
     sRGB -> relative luminance -> sRGB grey of that luminance.
     Gamma is applied in both directions; skipping it (the common
     shortcut of averaging the channels) lightens mid-tones badly
     and flattens exactly the contrast this is meant to preserve. */

  function toLinear(v) {
    v = v / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }
  function fromLinear(v) {
    v = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, v)) * 255);
  }
  function greyOf(r, g, b) {
    var y = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    return fromLinear(y);
  }

  var CHROMA_TOLERANCE = 10;   // already-neutral colours are left alone

  /* Rewrites every rgb()/rgba() inside a value. Handles the
     multi-colour properties — gradients and layered shadows —
     in one pass, which is why this is a string rewrite rather
     than a parse of a single colour. */
  function neutraliseValue(value) {
    if (!value || value === 'none') return null;
    var changed = false;
    var out = value.replace(/rgba?\(([^)]+)\)/g, function (whole, inner) {
      var n = inner.split(/[\s,\/]+/).filter(function (s) { return s !== ''; }).map(parseFloat);
      var r = n[0], g = n[1], b = n[2], a = n.length > 3 ? n[3] : undefined;
      if ([r, g, b].some(isNaN)) return whole;
      if (Math.max(r, g, b) - Math.min(r, g, b) < CHROMA_TOLERANCE) return whole;
      if (isInteractionBlue(r, g, b)) return whole;
      changed = true;
      var v = greyOf(r, g, b);
      return a === undefined
        ? 'rgb(' + v + ', ' + v + ', ' + v + ')'
        : 'rgba(' + v + ', ' + v + ', ' + v + ', ' + a + ')';
    });
    return changed ? out : null;
  }

  /* ---------- shadow roots ----------
     A stylesheet scoped to `html.wireframe-mode` cannot match inside
     a shadow root: `html` is not an ancestor within that tree scope,
     so every rule misses and the component keeps its original styling
     in full. Anything built on Lit, Stencil or Shoelace, and most
     design-system web components, put real interface behind that
     boundary.

     The fix is to adopt a copy of the sheet into each root with the
     scope prefix stripped. Stripping rather than rewriting to
     :host-context() on purpose: :host-context() is still not in
     Firefox, and since the sheet is only adopted while wireframe mode
     is on and dropped when it goes off, the scope has already done
     its job. */

  var shadowSheet = null;
  var adopted = [];

  function buildShadowSheet() {
    if (shadowSheet !== null) return shadowSheet;
    var text = '';
    for (var i = 0; i < document.styleSheets.length; i++) {
      var sheet = document.styleSheets[i];
      var rules;
      try { rules = sheet.cssRules; } catch (e) { continue; }  // cross-origin
      if (!rules) continue;
      for (var j = 0; j < rules.length; j++) {
        var t = rules[j].cssText;
        if (t.indexOf('.' + CLASS) === -1) continue;
        /* Order matters, and getting it wrong is silent.
           `html.wireframe-mode, html.wireframe-mode *` is the selector
           list that carries the whole typography spec. Strip the scope
           blindly and the first item becomes empty, which makes the
           selector list invalid, which makes the browser drop the entire
           rule — so the shadow root keeps its own typeface and nothing
           announces that it happened.
           Descendant forms (scope + space) lose the prefix; the bare
           form becomes :host, which is what the scope means inside a
           shadow root. */
        text += t
          .replace(/html\s*:where\(\.wireframe-mode\)\s+/g, '')
          .replace(/html\.wireframe-mode\s+/g, '')
          .replace(/html\s*:where\(\.wireframe-mode\)/g, ':host')
          .replace(/html\.wireframe-mode/g, ':host') + '\n';
      }
    }
    if (!text) { shadowSheet = false; return false; }
    try {
      var s = new CSSStyleSheet();
      s.replaceSync(text);
      shadowSheet = s;
    } catch (e) {
      shadowSheet = false;   // no constructable stylesheets
    }
    return shadowSheet;
  }

  function adopt(root) {
    var s = buildShadowSheet();
    if (!s || !root.adoptedStyleSheets) return;
    if (root.adoptedStyleSheets.indexOf(s) !== -1) return;
    try {
      root.adoptedStyleSheets = root.adoptedStyleSheets.concat([s]);
      adopted.push(root);
    } catch (e) {}
  }

  function unadopt() {
    adopted.forEach(function (root) {
      try {
        root.adoptedStyleSheets = root.adoptedStyleSheets.filter(function (x) {
          return x !== shadowSheet;
        });
      } catch (e) {}
    });
    adopted = [];
  }

  /* ---------- the pass ---------- */

  var touched = [];

  function neutraliseEl(el) {
    if (el.closest && el.closest('[data-wf-chrome]')) return;

    var computed = getComputedStyle(el);
    var wrote = false;

    for (var i = 0; i < PROPS.length; i++) {
      var next = neutraliseValue(computed.getPropertyValue(PROPS[i]));
      if (next === null) continue;
      el.style.setProperty(PROPS[i], next, 'important');
      wrote = true;
    }

    if (wrote) {
      el.setAttribute(MARK, '');
      touched.push(el);
    }
  }

  function walk(root) {
    var els = root.querySelectorAll('*');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      neutraliseEl(el);
      /* The toggle mounts its chrome in a shadow root precisely so the
         theme layer cannot reach it. Adopting the sheet into every root
         indiscriminately reaches straight past that and repaints the
         control in the product's wireframe styling — which is the exact
         confusion the shadow root was there to prevent. */
      if (el.shadowRoot && !el.hasAttribute('data-wf-chrome') &&
          !(el.closest && el.closest('[data-wf-chrome]'))) {
        adopt(el.shadowRoot);
        walk(el.shadowRoot);
      }
    }
  }

  function revert() {
    touched.forEach(function (el) {
      PROPS.forEach(function (p) { el.style.removeProperty(p); });
      el.removeAttribute(MARK);
    });
    touched = [];
    unadopt();
  }

  /* ---------- lifecycle ----------
     Re-runs on DOM change, because a single pass covers the screen
     that happened to be mounted when the toggle was flipped. In any
     routed app that is one screen out of a dozen, and the screens
     nobody demoed are exactly where the leaks are. Debounced, and
     paused while the pass itself is writing so it does not observe
     its own work. */

  var observer = null;
  var pending = null;
  var running = false;

  function run() {
    running = true;
    try { walk(document); } finally { running = false; }
  }

  function schedule() {
    if (running) return;
    clearTimeout(pending);
    pending = setTimeout(run, 60);
  }

  function on() {
    run();
    if (observer) return;
    observer = new MutationObserver(function (records) {
      if (running) return;
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.type === 'attributes' && r.attributeName === 'style' &&
            r.target.hasAttribute(MARK)) continue;   // our own write
        return schedule();
      }
    });
    observer.observe(document.documentElement, {
      childList: true, subtree: true,
      attributes: true, attributeFilter: ['class', 'style']
    });
  }

  function off() {
    if (observer) { observer.disconnect(); observer = null; }
    clearTimeout(pending);
    revert();
  }

  function sync() {
    if (document.documentElement.classList.contains(CLASS)) on();
    else off();
  }

  /* The toggle flips a class on <html>; watch for it rather than
     requiring the toggle to know this file exists. Either can be
     installed without the other. */
  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true, attributeFilter: ['class']
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }

  window.wireframeNeutralise = { run: run, revert: revert, sync: sync };
})();
