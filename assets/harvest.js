/* ============================================================
   Wireframe Review — palette harvest
   ------------------------------------------------------------
   Paste this into the browser console on a running prototype.
   It reports what the page is actually made of: the colours in
   use and how often, the typefaces, the radii, where colour is
   defined, and which elements are interactive.

   Nothing is changed and nothing is sent anywhere. The result
   is printed and copied to the clipboard.

   The point is that this is enough for Claude to write a
   wireframe layer for this specific prototype without anyone
   having to export the project first.
   ============================================================ */

(() => {
  const N = s => {
    const m = String(s).match(/[\d.]+/g);
    if (!m) return null;
    const [r, g, b, a] = m.map(Number);
    if (a === 0) return null;
    return [r, g, b];
  };
  const hex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  const grey = c => Math.max(...c) - Math.min(...c) < 10;
  const lum = c => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;

  const els = [...document.querySelectorAll('body *')].filter(e => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden';
  });

  const tally = {};
  const bump = (bucket, value, el) => {
    const c = N(value);
    if (!c) return;
    const k = hex(c);
    const t = (tally[k] ||= { hex: k, grey: grey(c), lum: +lum(c).toFixed(2), n: 0, where: {} });
    t.n++;
    t.where[bucket] = (t.where[bucket] || 0) + 1;
  };

  const INTERACTIVE = 'a[href],button,[role="button"],[role="tab"],[role="menuitem"],[role="link"],summary,input,select,textarea';
  const fonts = {}, radii = {}, weights = {};
  let interactive = 0, interactiveNoAffordance = 0;

  els.forEach(el => {
    const s = getComputedStyle(el);
    bump('text', s.color, el);
    bump('surface', s.backgroundColor, el);
    bump('border', s.borderTopColor, el);
    if (s.backgroundImage && s.backgroundImage !== 'none') {
      (s.backgroundImage.match(/rgba?\([^)]+\)/g) || []).forEach(v => bump('gradient', v, el));
    }
    // Only on SVG. `fill` and `stroke` are inherited properties that compute
    // to black on every element in the document, so reading them everywhere
    // buries the real palette under one meaningless entry.
    if (el.namespaceURI === 'http://www.w3.org/2000/svg') {
      if (s.fill && s.fill !== 'none') bump('icon', s.fill, el);
      if (s.stroke && s.stroke !== 'none') bump('icon', s.stroke, el);
    }

    const f = s.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    if (f) fonts[f] = (fonts[f] || 0) + 1;
    weights[s.fontWeight] = (weights[s.fontWeight] || 0) + 1;
    if (s.borderTopLeftRadius !== '0px') radii[s.borderTopLeftRadius] = (radii[s.borderTopLeftRadius] || 0) + 1;

    if (el.matches(INTERACTIVE)) {
      interactive++;
      if (el.matches(':disabled, [aria-disabled="true"]')) return;
      const own = N(s.backgroundColor), txt = N(s.color);
      if ((!own || grey(own)) && (!txt || grey(txt)) && s.textDecorationLine === 'none') interactiveNoAffordance++;
    }
  });

  // Where is colour defined?
  const rootVars = [...document.styleSheets].flatMap(ss => {
    try { return [...ss.cssRules]; } catch (e) { return []; }
  }).flatMap(r => (r.style ? [...r.style] : [])).filter(p => p.startsWith('--'));

  const classes = new Set();
  els.forEach(e => String(e.className).split(/\s+/).forEach(c => c && classes.add(c)));
  const tw = [...classes].filter(c => /^(bg|text|border|from|to|via)-[a-z]+-\d{2,3}$/.test(c));
  const inlineColour = els.filter(e => /#[0-9a-f]{3,8}|rgb/i.test(e.getAttribute('style') || '')).length;

  const colours = Object.values(tally).sort((a, b) => b.n - a.n);
  const report = {
    url: location.href,
    screen: document.title,
    elements: els.length,
    stack: {
      tailwindUtilityClasses: tw.length,
      tailwindExamples: tw.slice(0, 12),
      cssCustomProperties: [...new Set(rootVars)].slice(0, 40),
      elementsWithInlineColour: inlineColour,
      canvasElements: document.querySelectorAll('canvas').length,
      inlineSvgElements: document.querySelectorAll('svg').length,
      stylesheetBackgroundImages: els.filter(e => {
        const b = getComputedStyle(e).backgroundImage;
        return b.includes('url(') && !(e.getAttribute('style') || '').includes('url(');
      }).length,
      emoji: (document.body.innerText.match(/\p{Extended_Pictographic}/gu) || []).length,
    },
    typography: { families: fonts, weights },
    radii,
    colours: {
      distinct: colours.length,
      nonGrey: colours.filter(c => !c.grey).length,
      top: colours.slice(0, 30),
    },
    interaction: {
      interactiveElements: interactive,
      interactiveWithNoVisualAffordance: interactiveNoAffordance,
    },
  };

  const out = JSON.stringify(report, null, 2);
  console.log(report);
  try { copy(out); console.log('%cCopied to clipboard. Paste it to Claude.', 'font-weight:700'); }
  catch (e) { console.log('Copy the object above by hand, or run: copy(JSON.stringify(report))'); }
  return report;
})();
