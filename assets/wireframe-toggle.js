/* ============================================================
   Wireframe Review — the switcher
   ------------------------------------------------------------
   Flips `wireframe-mode` on <html> and remembers the choice.
   No reload, no route change, no state lost: a reviewer can be
   halfway through a task, flip to the styled version to check
   they are on the same screen, and flip back.

   Two ways to use it:
     - Plain HTML: a script tag pointing at this file, last thing
       before the closing body tag. That is all.
     - React: import { WireframeToggle } and render it once at
       the root of the app. See the bottom of this file.

   (No literal closing-script tag appears anywhere in this file,
   including in comments. An HTML parser would treat one as the end
   of the block and silently truncate the script if you ever inline
   this file rather than linking it.)
   ============================================================ */

(function () {
  'use strict';

  var KEY = 'wf-mode';
  var CLASS = 'wireframe-mode';

  function isOn() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }

  function apply(on) {
    document.documentElement.classList.toggle(CLASS, on);
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
    var el = document.getElementById('wf-toggle');
    if (el) render(el, on);
  }

  function render(host, on) {
    // The control lives in a shadow root so the wireframe theme
    // layer cannot reach it. Without this the toggle turns blue
    // along with everything else clickable, which is confusing
    // and makes it look like part of the product.
    var root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    root.innerHTML =
      '<div style="display:flex;align-items:center;gap:6px;' +
      'font-family:Inter,Helvetica,Arial,sans-serif;color:#52525b">' +
      '<span style="font-weight:600;letter-spacing:.02em;text-transform:uppercase;font-size:10px;opacity:.55">View</span>' +
      btn('Design', !on) + btn('Wireframe', on) + '</div>';
    var kids = root.querySelectorAll('button');
    kids[0].onclick = function () { apply(false); };
    kids[1].onclick = function () { apply(true); };
  }

  function btn(label, active) {
    return '<button type="button" style="' +
      'all:unset;cursor:pointer;padding:5px 10px;border-radius:6px;font-size:12px;' +
      'font-family:Inter,Helvetica,Arial,sans-serif;line-height:1;' +
      (active
        ? 'background:#18181b;color:#fff;font-weight:600;'
        : 'color:#52525b;font-weight:500;') +
      '">' + label + '</button>';
  }

  function mount() {
    if (document.getElementById('wf-toggle')) return;
    var root = document.createElement('div');
    root.id = 'wf-toggle';
    root.setAttribute('data-wf-chrome', '');
    root.style.cssText = [
      // Bottom right, because top right is where products put their own
      // account menu and primary action, and review chrome that covers
      // the thing under review is its own small disaster.
      'position:fixed', 'bottom:12px', 'right:12px', 'z-index:2147483647',
      'display:flex', 'align-items:center', 'gap:6px',
      'padding:5px 7px', 'border-radius:9px',
      'background:rgba(255,255,255,.92)', 'backdrop-filter:blur(8px)',
      'border:1px solid rgba(0,0,0,.10)',
      'box-shadow:0 2px 8px rgba(0,0,0,.10)',
      'font-family:Inter,Helvetica,Arial,sans-serif'
    ].join(';');
    document.body.appendChild(root);
    render(root, isOn());
  }

  // Set the class before first paint so the wireframe does not
  // flash the styled version on load.
  if (isOn()) document.documentElement.classList.add(CLASS);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  // Keyboard shortcut. Useful in a live review: you can flip without
  // moving the cursor away from what you are discussing.
  // Alt+W, not Cmd/Ctrl+Shift+W, which is "close window" in every major
  // browser and cannot be intercepted. Ignored while the caret is in a
  // field, so typing a "w" into a form does not flip the whole review.
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.altKey && !e.metaKey && !e.ctrlKey && String(e.key).toLowerCase() === 'w') {
      e.preventDefault();
      apply(!document.documentElement.classList.contains(CLASS));
    }
  });

  window.wireframeMode = { on: function () { apply(true); }, off: function () { apply(false); } };
})();

/* ------------------------------------------------------------
   React version. Render <WireframeToggle /> once, at the root.
   Import the CSS file separately, as you would any global sheet.
   ------------------------------------------------------------

import { useEffect, useState } from 'react';

export function WireframeToggle() {
  const [on, setOn] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('wf-mode') === '1'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('wireframe-mode', on);
    localStorage.setItem('wf-mode', on ? '1' : '0');
  }, [on]);

  const base = {
    all: 'unset', cursor: 'pointer', padding: '5px 10px',
    borderRadius: 6, fontSize: 12, lineHeight: 1,
    fontFamily: 'Inter, Helvetica, Arial, sans-serif',
  };

  return (
    <div
      data-wf-chrome
      style={{
        position: 'fixed', bottom: 12, right: 12, zIndex: 2147483647,
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 7px', borderRadius: 9,
        background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(0,0,0,.10)',
        boxShadow: '0 2px 8px rgba(0,0,0,.10)',
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 600, opacity: .55, textTransform: 'uppercase' }}>
        View
      </span>
      <button style={{ ...base, background: on ? 'none' : '#18181b', color: on ? '#52525b' : '#fff', fontWeight: on ? 500 : 600 }} onClick={() => setOn(false)}>
        Design
      </button>
      <button style={{ ...base, background: on ? '#18181b' : 'none', color: on ? '#fff' : '#52525b', fontWeight: on ? 600 : 500 }} onClick={() => setOn(true)}>
        Wireframe
      </button>
    </div>
  );
}

------------------------------------------------------------ */
