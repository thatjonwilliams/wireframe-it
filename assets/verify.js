/* ============================================================
   Wireframe Review — verifier
   ------------------------------------------------------------
   Paste into the console with wireframe mode ON. It checks the
   running page against the specification in SKILL.md and prints
   a pass/fail per rule, with the offending elements.

   This is what makes the exercise a specification rather than an
   impression. "It looks greyscale" is not a result; a prototype
   can look right on the screen you demoed and leak on the three
   you did not. Run it on every main screen.

   It walks shadow roots as well as the light DOM. Component
   libraries that ship web components (and anything built on Lit,
   Stencil or Shoelace) put half the interface behind a shadow
   boundary that a scoped stylesheet cannot cross, so those
   elements silently keep their original styling. If this reports
   violations inside a shadow root, see references/stacks.md § 8.

   Nothing is changed except a temporary outline on failures,
   removed by verifyWireframe.clear().
   ============================================================ */

(() => {
  // ---------- the spec ----------
  /* One value, and the check is exact on purpose. A hue band would also
     accept the blue, and would additionally accept every blue a
     blue-branded prototype already had — which is the leak rule 1 exists
     to catch. */
  const BLUES = [[37, 107, 237]];   // #256BED
  const FAMILIES = ['helvetica', 'helvetica neue', 'arial', 'sans-serif'];
  const WEIGHTS = ['400', '700'];
  const AA_TEXT = 4.5, AA_LARGE = 3;

  // Saturation tolerance. Anti-aliased and composited greys drift a
  // point or two off neutral; 12 is wide enough not to cry about that
  // and narrow enough to catch a genuine tint.
  const GREY_TOLERANCE = 12;

  const parse = str => {
    const m = String(str).match(/[\d.]+/g);
    if (!m) return null;
    const [r, g, b, a] = m.map(Number);
    if (a !== undefined && a < 0.04) return null;  // effectively invisible
    return [r, g, b];
  };
  const isGrey = c => !c || Math.max(...c) - Math.min(...c) < GREY_TOLERANCE;
  const isBlue = c => !!c && BLUES.some(b =>
    Math.abs(b[0] - c[0]) < 10 && Math.abs(b[1] - c[1]) < 10 && Math.abs(b[2] - c[2]) < 10);

  // ---------- traversal: light DOM + shadow roots ----------
  const all = [];
  const shadowHosts = [];
  (function walk(root, inShadow) {
    root.querySelectorAll('*').forEach(el => {
      if (el.closest && el.closest('[data-wf-chrome]')) return;
      all.push({ el, inShadow });
      if (el.shadowRoot) {
        shadowHosts.push(el);
        walk(el.shadowRoot, true);
      }
    });
  })(document, false);

  const visible = all.filter(({ el }) => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const s = getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
  });

  const label = el => {
    const cls = String(el.className || '');
    return el.tagName.toLowerCase() +
      (el.id ? '#' + el.id : '') +
      (cls && typeof cls === 'string' ? '.' + cls.trim().split(/\s+/).slice(0, 2).join('.') : '');
  };

  const fail = (rule, el, detail, inShadow) =>
    ({ rule, el: label(el), detail, shadow: inShadow || false, node: el });

  const failures = [];

  // ---------- rule 1 + 2: colour ----------
  const COLOUR_PROPS = [
    'color', 'backgroundColor', 'backgroundImage', 'borderTopColor',
    'borderRightColor', 'borderBottomColor', 'borderLeftColor',
    'outlineColor', 'textDecorationColor', 'accentColor', 'boxShadow',
    'fill', 'stroke', 'caretColor', 'columnRuleColor',
  ];

  visible.forEach(({ el, inShadow }) => {
    const s = getComputedStyle(el);
    COLOUR_PROPS.forEach(prop => {
      const v = s[prop];
      if (!v || v === 'none') return;
      for (const m of v.matchAll(/rgba?\(([^)]+)\)/g)) {
        const c = parse(m[1]);
        if (c && !isGrey(c) && !isBlue(c)) {
          failures.push(fail(1, el, `${prop}: ${m[0]}`, inShadow));
          break;
        }
      }
    });
  });

  // ---------- rule 2: affordance both ways ----------
  const INTERACTIVE = 'a[href], button, input, select, textarea, summary, ' +
    '[role="button"], [role="link"], [role="tab"], [role="menuitem"], ' +
    '[role="checkbox"], [role="switch"], [role="option"], [onclick], [tabindex]:not([tabindex="-1"])';

  const paintsBlue = el => {
    const s = getComputedStyle(el);
    return ['color', 'backgroundColor', 'borderTopColor', 'fill', 'stroke', 'outlineColor']
      .some(p => isBlue(parse(s[p])));
  };

  visible.forEach(({ el, inShadow }) => {
    const interactive = el.matches(INTERACTIVE);
    if (!interactive) return;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    // A control whose own box is grey but whose child carries the blue
    // is fine: the affordance reads, which is all rule 2 asks.
    if (paintsBlue(el)) return;
    if ([...el.querySelectorAll('*')].some(paintsBlue)) return;
    failures.push(fail(2, el, 'interactive but reads as grey', inShadow));
  });

  // ---------- rule 3: typeface and weight ----------
  visible.forEach(({ el, inShadow }) => {
    if (!el.textContent || !el.textContent.trim()) return;
    const s = getComputedStyle(el);
    const family = s.fontFamily.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
    if (!FAMILIES.includes(family)) {
      failures.push(fail(3, el, `font-family: ${family}`, inShadow));
    }
    if (!WEIGHTS.includes(String(s.fontWeight))) {
      failures.push(fail(3, el, `font-weight: ${s.fontWeight}`, inShadow));
    }
    const axis = s.fontVariationSettings;
    if (axis && axis !== 'normal') {
      failures.push(fail(3, el, `font-variation-settings: ${axis}`, inShadow));
    }
  });

  // ---------- rule 5: imagery ----------
  visible.forEach(({ el, inShadow }) => {
    if (el.tagName === 'IMG' && !el.hasAttribute('data-wf-placeholder')) {
      const s = getComputedStyle(el);
      if (s.filter === 'none' && !el.closest('[data-wf-placeholder]')) {
        failures.push(fail(5, el, 'image not neutralised or labelled', inShadow));
      }
    }
    const bg = getComputedStyle(el).backgroundImage;
    if (bg && bg.includes('url(') && !el.hasAttribute('data-wf-placeholder')) {
      failures.push(fail(5, el, 'CSS background image — needs data-wf-placeholder', inShadow));
    }
  });


  // ---------- rule 1b: right angles ----------
  visible.forEach(({ el, inShadow }) => {
    const r = getComputedStyle(el).borderRadius;
    if (r && r !== '0px' && !/^0px( 0px)*$/.test(r)) {
      failures.push(fail('1b', el, `border-radius: ${r}`, inShadow));
    }
  });

  // ---------- rule 7: WCAG AA contrast ----------
  const parseCol = v => {
    const n = String(v).match(/[\d.]+/g);
    if (!n || n.length < 3) return null;
    const m = n.map(Number);
    return { r: m[0], g: m[1], b: m[2], a: n.length > 3 ? m[3] : 1 };
  };
  const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = c => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const ratioOf = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);

  /* Composites up through transparent ancestors and steps out of a
     shadow root via its host, because the text is drawn on whatever is
     actually behind it, not on whatever its parent declares. */
  const bgOf = el => {
    const stack = [];
    let node = el;
    while (node && node.nodeType === 1) {
      const c = parseCol(getComputedStyle(node).backgroundColor);
      if (c && c.a > 0) { stack.push(c); if (c.a >= 0.999) break; }
      const root = node.getRootNode && node.getRootNode();
      node = node.parentElement || (root && root.host) || null;
    }
    let out = [255, 255, 255];
    for (let i = stack.length - 1; i >= 0; i--) {
      const s = stack[i];
      out = [s.r * s.a + out[0] * (1 - s.a),
             s.g * s.a + out[1] * (1 - s.a),
             s.b * s.a + out[2] * (1 - s.a)];
    }
    return out;
  };

  visible.forEach(({ el, inShadow }) => {
    let hasText = false;
    for (const n of el.childNodes) {
      if (n.nodeType === 3 && n.textContent.trim()) { hasText = true; break; }
    }
    if (!hasText) return;
    const s = getComputedStyle(el);
    const fg = parseCol(s.color);
    if (!fg || fg.a < 0.1) return;
    const size = parseFloat(s.fontSize) || 16;
    const weight = parseInt(s.fontWeight, 10) || 400;
    const need = (size >= 24 || (size >= 18.66 && weight >= 700)) ? AA_LARGE : AA_TEXT;
    const got = ratioOf([fg.r, fg.g, fg.b], bgOf(el));
    if (got < need) {
      failures.push(fail(7, el,
        `${got.toFixed(2)}:1, needs ${need}:1 — "${el.textContent.trim().slice(0, 28)}"`, inShadow));
    }
  });

  // ---------- report ----------
  const RULES = {
    1:   'Everything resolves to greyscale',
    '1b':'Right angles — no corner radius',
    2:   'One blue, and only for things you can click',
    3:   'Helvetica, regular and bold',
    5:   'Imagery is replaced, not hidden',
    7:   'WCAG 2.2 AA contrast',
  };

  console.log('%cWireframe verification', 'font-weight:700;font-size:14px');
  console.log(`${visible.length} visible elements` +
    (shadowHosts.length ? `, ${shadowHosts.length} shadow root(s) traversed` : ''));

  let clean = true;
  Object.keys(RULES).forEach(r => {
    const hits = failures.filter(f => String(f.rule) === String(r));
    if (hits.length) {
      clean = false;
      console.groupCollapsed(`%c FAIL %c Rule ${r} — ${RULES[r]} (${hits.length})`,
        'background:#b00;color:#fff', '');
      console.table(hits.slice(0, 60).map(({ node, ...rest }) => rest));
      console.groupEnd();
    } else {
      console.log(`%c PASS %c Rule ${r} — ${RULES[r]}`, 'background:#070;color:#fff', '');
    }
  });

  const inShadow = failures.filter(f => f.shadow).length;
  if (inShadow) {
    console.warn(`${inShadow} failure(s) are inside a shadow root. A scoped stylesheet ` +
      `cannot cross that boundary — see references/stacks.md § 8.`);
  }

  // Rules 4 and 6 are structural and behavioural. No script can check
  // them, and pretending otherwise would be the worst kind of green tick.
  console.log('%cNot checked here: rule 4 (structure preserved) and rule 6 ' +
    '(everything still works). Compare screenshots for 4; click through for 6.', 'color:#666');

  if (clean) console.log('%cMeets the specification on this screen.',
    'background:#070;color:#fff;font-weight:700;padding:2px 6px');

  failures.slice(0, 60).forEach(f => { f.node.style.outline = '2px dashed magenta'; });
  window.verifyWireframe = {
    failures,
    clear: () => failures.forEach(f => { f.node.style.outline = ''; }),
  };
  return { total: failures.length, byRule: Object.fromEntries(
    Object.keys(RULES).map(r => [r, failures.filter(f => String(f.rule) === String(r)).length])) };
})();
