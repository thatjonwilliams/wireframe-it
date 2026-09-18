/* ============================================================
   Wireframe It — self-test
   ------------------------------------------------------------
   Load on the fixture page and call:

       await wfSelfTest()

   Returns { pass, results } and prints a table. No test runner,
   no package to install, no browser automation: the assertions
   need a real cascade and real computed styles, which is exactly
   what the page already has.

   Run this after ANY edit to the assets. The failure mode it
   exists to catch is the quiet one — an override that stops
   matching, a selector rewrite that drops a rule — where the
   page still looks broadly grey and nothing announces that the
   spec is no longer met.
   ============================================================ */

(function () {
  'use strict';

  var CLASS = 'wireframe-mode';

  /* Resolved from this script's own URL rather than the page's, so the
     fixture can be served from any directory depth without the fetch
     below silently 404ing and taking four assertions down with it. */
  var VERIFY_URL = (function () {
    var me = document.currentScript && document.currentScript.src;
    return me ? new URL('../assets/verify.js', me).href : '../../assets/verify.js';
  })();
  var settle = function (ms) { return new Promise(function (r) { setTimeout(r, ms || 400); }); };

  function snapshot() {
    var out = [];
    (function walk(root) {
      root.querySelectorAll('*').forEach(function (el) {
        if (el.closest && el.closest('[data-wf-chrome]')) return;
        var s = getComputedStyle(el);
        out.push([s.color, s.backgroundColor, s.backgroundImage, s.fontFamily,
                  s.fontWeight, s.borderTopColor, s.boxShadow, s.fill, s.stroke].join('|'));
        if (el.shadowRoot) walk(el.shadowRoot);
      });
    })(document);
    return out.join('\n');
  }

  function geometry() {
    var out = [];
    (function walk(root) {
      root.querySelectorAll('*').forEach(function (el) {
        if (el.closest && el.closest('[data-wf-chrome]')) return;
        var r = el.getBoundingClientRect();
        out.push({ y: Math.round(r.y), h: Math.round(r.height) });
        if (el.shadowRoot) walk(el.shadowRoot);
      });
    })(document);
    return out;
  }

  window.wfSelfTest = async function () {
    var results = [];
    var add = function (name, pass, detail) { results.push({ test: name, pass: !!pass, detail: detail || '' }); };

    // ---------- baseline ----------
    document.documentElement.classList.remove(CLASS);
    await settle();
    var styledStyles = snapshot();
    var styledGeom = geometry();
    var styledHeight = document.documentElement.scrollHeight;

    var authorInline = [];
    (function walk(root) {
      root.querySelectorAll('[style]').forEach(function (el) {
        if (el.closest && el.closest('[data-wf-chrome]')) return;
        authorInline.push({ el: el, css: el.getAttribute('style') });
        if (el.shadowRoot) walk(el.shadowRoot);
      });
    })(document);

    // ---------- on ----------
    document.documentElement.classList.add(CLASS);
    await settle();
    var wfStyles = snapshot();
    var wfGeom = geometry();
    var wfHeight = document.documentElement.scrollHeight;

    add('wireframe mode changes the page', styledStyles !== wfStyles,
        styledStyles === wfStyles ? 'nothing changed — is wireframe.css loaded?' : '');

    /* Rule 4 is the one the other rules are in service of: change the
       layout as well as the palette and no finding from the session can
       be attributed to either.

       But byte-identical geometry is the wrong bar, and asserting it was
       a real bug in this test. Rule 3 replaces the typeface, and a
       typeface has metrics — on this fixture, swapping Georgia for
       Helvetica narrows the h1's text box by 11px. Nothing moved
       vertically by more than 1px, which is the distinction that
       matters: horizontal text-box width is invisible to a reviewer,
       whereas a line wrapping where it did not before genuinely changes
       the page being judged.

       So: vertical position is held to 2px and total document height to
       4px, and horizontal text reflow is allowed. If a future edit makes
       something wrap, this catches it. */
    var vShift = 0;
    for (var gi = 0; gi < styledGeom.length; gi++) {
      vShift = Math.max(vShift, Math.abs(wfGeom[gi].y - styledGeom[gi].y),
                                Math.abs(wfGeom[gi].h - styledGeom[gi].h));
    }
    add('rule 4 — nothing reflows vertically', vShift <= 2, vShift + 'px max vertical shift');
    add('rule 4 — document height holds', Math.abs(wfHeight - styledHeight) <= 4,
        Math.abs(wfHeight - styledHeight) + 'px difference');

    // ---------- spec ----------
    var res = await fetch(VERIFY_URL);
    if (!res.ok) throw new Error('could not load ' + VERIFY_URL + ' (' + res.status + ')');
    var src = await res.text();
    var v = eval(src);
    add('rule 1 — greyscale only', v.byRule['1'] === 0, v.byRule['1'] + ' violation(s)');
    add('rule 2 — affordances read', v.byRule['2'] === 0, v.byRule['2'] + ' violation(s)');
    add('rule 3 — Helvetica 400/700', v.byRule['3'] === 0, v.byRule['3'] + ' violation(s)');
    add('rule 5 — imagery replaced', v.byRule['5'] === 0, v.byRule['5'] + ' violation(s)');
    add('rule 1b — right angles only', v.byRule['1b'] === 0, v.byRule['1b'] + ' violation(s)');
    add('rule 7 — WCAG AA contrast', v.byRule['7'] === 0, v.byRule['7'] + ' violation(s)');
    if (window.verifyWireframe) window.verifyWireframe.clear();

    // ---------- typography, checked directly ----------
    var fams = new Set(), weights = new Set();
    (function walk(root) {
      root.querySelectorAll('*').forEach(function (el) {
        if (el.closest && el.closest('[data-wf-chrome]')) return;
        if (!el.textContent || !el.textContent.trim()) return;
        var s = getComputedStyle(el);
        fams.add(s.fontFamily.split(',')[0].replace(/["']/g, '').trim().toLowerCase());
        weights.add(String(s.fontWeight));
        if (el.shadowRoot) walk(el.shadowRoot);
      });
    })(document);
    add('exactly one typeface renders', fams.size === 1 && fams.has('helvetica'),
        [].concat(Array.from(fams)).join(', '));
    add('at most two weights render',
        Array.from(weights).every(function (w) { return w === '400' || w === '700'; }),
        Array.from(weights).sort().join(', '));

    /* ---------- one blue ----------
       The assertion that answers "these look like multiple blues". It
       counts distinct non-grey values actually RENDERED, so it catches a
       second blue however it arrives: a hover variant, an on-dark variant,
       a pale tint used as a surface, or a shade derived at runtime to
       clear a contrast threshold. All four existed here at one point. */
    var nonGrey = new Set();
    var COLOUR_PROPS = ['color', 'backgroundColor', 'borderTopColor',
                        'borderBottomColor', 'fill', 'stroke', 'outlineColor'];
    (function walk(root) {
      root.querySelectorAll('*').forEach(function (el) {
        if (el.closest && el.closest('[data-wf-chrome]')) return;
        var cs = getComputedStyle(el);
        COLOUR_PROPS.forEach(function (p) {
          var m = String(cs[p]).match(/\d+/g);
          if (!m || m.length < 3) return;
          var r = +m[0], g = +m[1], b = +m[2];
          if (Math.max(r, g, b) - Math.min(r, g, b) < 12) return;
          nonGrey.add('rgb(' + r + ',' + g + ',' + b + ')');
        });
        if (el.shadowRoot) walk(el.shadowRoot);
      });
    })(document);
    add('exactly one non-grey colour renders', nonGrey.size === 1,
        nonGrey.size + ': ' + Array.from(nonGrey).join(' '));

    // ---------- right angles, checked directly ----------
    var radii = new Set();
    (function walk(root) {
      root.querySelectorAll('*').forEach(function (el) {
        if (el.closest && el.closest('[data-wf-chrome]')) return;
        radii.add(getComputedStyle(el).borderRadius);
        if (el.shadowRoot) walk(el.shadowRoot);
      });
    })(document);
    add('only one corner radius renders, and it is zero',
        radii.size === 1 && radii.has('0px'),
        Array.from(radii).slice(0, 4).join(' / '));

    // ---------- off ----------
    document.documentElement.classList.remove(CLASS);
    await settle();
    var restored = snapshot();

    /* The promise the skill makes to a founder is that nothing they
       built is lost. This is that promise, asserted.

       IMPORTANT: this only means anything on a FRESH page load. An earlier
       version of it passed for days while the neutraliser was destroying
       the fixture's inline styles, because the baseline snapshot was taken
       after a previous toggle had already stripped them — the test was
       comparing damage to damage. Reload before trusting a pass. */
    add('reverts exactly — nothing is destroyed', restored === styledStyles,
        restored === styledStyles ? '' : 'styled state did not come back identical');

    /* The sharper version of the same thing, and the one that actually
       caught it. The author's own `style` attribute must come back
       character for character — including shorthands, which decompose and
       lose their value if they are taken apart with removeProperty. */
    var inlineIntact = true, inlineDetail = '';
    authorInline.forEach(function (rec) {
      var now = rec.el.getAttribute('style');
      if (now !== rec.css) {
        inlineIntact = false;
        if (!inlineDetail) inlineDetail = (rec.css || '(none)') + '  ->  ' + (now || '(removed)');
      }
    });
    add('author inline styles survive a cycle', inlineIntact,
        inlineIntact ? authorInline.length + ' checked' : inlineDetail);
    add('no leftover markers in the DOM',
        document.querySelectorAll('[data-wf-neutralised]').length === 0,
        document.querySelectorAll('[data-wf-neutralised]').length + ' left behind');

    var pass = results.every(function (r) { return r.pass; });
    console.table(results);
    console.log(pass
      ? '%c ALL PASS %c wireframe-it meets its specification on this fixture'
      : '%c FAIL %c see the table above',
      pass ? 'background:#070;color:#fff' : 'background:#b00;color:#fff', '');
    return { pass: pass, results: results };
  };
})();
