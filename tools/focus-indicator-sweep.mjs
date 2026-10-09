// Does anything focusable in the docs site draw NO focus indicator, does everything focusable
// have an accessible name, and does each ring fit what it rings (an icon-only control's glyph in
// the centre, 24x24, clear of its text)? A MEASUREMENT, not a gate — it needs the docs dev server, so it is run
// by hand and its answer is recorded in docs/todo.md.
//
//   npm run dev:docs
//   SWEEP_DIR=<scratch> SWEEP_URLS="http://localhost:4279/,http://localhost:4279/components/button"
//   node tools/focus-indicator-sweep.mjs
//
// FULL urls, not paths: Git Bash rewrites an env value starting with `/` into a Windows path. One
// url per docs GROUP page covers every section it owns.
//
// It forces the pseudo-class through CDP rather than focusing anything, and reads the element AND
// its ancestors — programmatic focus does not reliably grant `:focus-visible`, and the ring is
// drawn on the shell for checkbox, radio, switch and table rows. Every run plants a bare
// `<button>` as the negative arm.
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SCRATCH = process.env.SWEEP_DIR ?? process.cwd();
const PROFILE = join(SCRATCH, 'chrome-focus-sweep');
const PORT = 9224;
const ORIGIN = process.env.SWEEP_ORIGIN ?? 'http://localhost:4279';
// Full URLs, not paths: this runs from Git Bash, which rewrites an env value that starts with `/`
// into a Windows path (`/components/button` arrived as `C:/Program Files/Git/components/button`).
const URLS = process.env.SWEEP_URLS.split(',').map((u) =>
  u.startsWith('http') ? u : `${ORIGIN}${u}`,
);

rmSync(PROFILE, { recursive: true, force: true });
mkdirSync(PROFILE, { recursive: true });

const chromePath =
  process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--force-color-profile=srgb',
    '--window-size=1440,900',
    'about:blank',
  ],
  { stdio: 'ignore' },
);
process.on('exit', () => chrome.kill());

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let version;
for (let attempt = 0; attempt < 60; attempt += 1) {
  try {
    version = await (
      await fetch(`http://127.0.0.1:${PORT}/json/version`)
    ).json();
    break;
  } catch {
    await sleep(250);
  }
}
if (!version) throw new Error('Chrome never opened its debugging port');

const socket = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let nextId = 1;
const pending = new Map();
const events = [];
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    message.error
      ? reject(new Error(JSON.stringify(message.error)))
      : resolve(message.result);
    return;
  }
  events.push(message);
});

const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, sessionId }));
  });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', {
  targetId,
  flatten: true,
});
const cdp = (method, params) => send(method, params, sessionId);

for (const domain of ['Page', 'DOM', 'CSS', 'Runtime', 'Accessibility']) {
  await cdp(`${domain}.enable`);
}

const evaluate = async (expression, awaitPromise = false) => {
  const { result, exceptionDetails } = await cdp('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise,
  });
  if (exceptionDetails)
    throw new Error(
      exceptionDetails.text +
        ' — ' +
        (exceptionDetails.exception?.description ?? ''),
    );
  return result.value;
};

// ── in-page helpers ─────────────────────────────────────────────────────────
// One function object on window, so each per-element call is a small evaluate rather than a
// re-parse of the whole body.
const INSTALL = String.raw`
window.__sweep = (() => {
  const FOCUSABLE = [
    'a[href]', 'button', 'input', 'select', 'textarea', 'summary',
    '[tabindex]:not([tabindex="-1"])', '[contenteditable="true"]',
    'audio[controls]', 'video[controls]', 'area[href]', 'iframe',
  ].join(',');

  const PROPS = [
    'outline-style', 'outline-width', 'outline-color', 'outline-offset',
    'box-shadow', 'border-top-color', 'border-top-width', 'border-top-style',
    'background-color', 'color', 'text-decoration-line', 'filter', 'opacity',
  ];

  const chainOf = (el) => {
    const chain = [];
    let node = el;
    for (let depth = 0; node && node !== document.body && depth < 9; depth += 1) {
      chain.push(node);
      node = node.parentElement;
    }
    return chain;
  };

  // ::before and ::after are read too, because an indicator is not always on the element: the
  // table's column-resize handle is a hairline whose ::after widens and takes a colour on focus,
  // and reading elements alone scored all 14 of them as having no indicator at all.
  const signature = (el) =>
    chainOf(el).flatMap((node) =>
      [null, '::before', '::after'].map((pseudo) => {
        const style = getComputedStyle(node, pseudo);
        const out = { _pseudo: pseudo ?? 'element' };
        for (const prop of PROPS) out[prop] = style.getPropertyValue(prop);
        out.width = style.getPropertyValue('width');
        out.content = pseudo ? style.getPropertyValue('content') : 'normal';
        return out;
      }),
    );

  const describe = (el) => {
    const host = el.closest('[class*="ds-"], [_nghost], ds-docs-root') ?? el;
    const tagChain = chainOf(el).map((n) => n.tagName.toLowerCase()).join(' < ');
    return {
      tag: el.tagName.toLowerCase(),
      classes: el.getAttribute('class') ?? '',
      id: el.id || null,
      chain: tagChain,
      hostTag: host.tagName.toLowerCase(),
      component: (chainOf(el).find((n) => n.tagName.startsWith('DS-')) ?? {}).tagName?.toLowerCase() ?? null,
      text: (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 60),
      ariaLabel: el.getAttribute('aria-label'),
      ariaLabelledby: el.getAttribute('aria-labelledby'),
      title: el.getAttribute('title'),
      type: el.getAttribute('type'),
      role: el.getAttribute('role'),
      tabindex: el.getAttribute('tabindex'),
      disabled: el.matches(':disabled') || el.getAttribute('aria-disabled') === 'true',
      hostComponentLabel: (() => {
        const host = chainOf(el).find((n) => n.tagName.startsWith('DS-'));
        if (!host) return null;
        const own = host.querySelector('.label, .control-text, legend, .field-label');
        return {
          hostAriaLabel: host.getAttribute('aria-label'),
          hostLabelAttr: host.getAttribute('label'),
          renderedLabel: own ? (own.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 60) : null,
        };
      })(),
      rect: (() => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })(),
      visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
    };
  };

  return {
    tag() {
      let index = 0;
      const rows = [];
      for (const el of document.querySelectorAll(FOCUSABLE)) {
        // A hidden element cannot be Tabbed to, so it is out of scope for 2.4.7; a zero-size one
        // is usually a visually-hidden input whose ring belongs to a sibling shell.
        if (!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)) continue;
        el.setAttribute('data-sweep-id', String(index));
        rows.push({ sweepId: index, ...describe(el) });
        index += 1;
      }
      return rows;
    },
    // Chrome recomputes :has(:focus-visible) against a forced pseudo state but NOT :focus-within,
    // which is a flag propagated at real focus time — so the chain has to be forced too, or every
    // field shell reads as unlit. (No backticks: this block lives in a template literal.)
    markChain(id) {
      for (const stale of document.querySelectorAll('[data-sweep-anc]')) stale.removeAttribute('data-sweep-anc');
      const el = document.querySelector('[data-sweep-id="' + id + '"]');
      if (!el) return 0;
      let count = 0;
      for (const node of chainOf(el)) {
        if (node === el) continue;
        node.setAttribute('data-sweep-anc', String(count));
        count += 1;
      }
      return count;
    },
    signature(id) {
      const el = document.querySelector('[data-sweep-id="' + id + '"]');
      return el ? signature(el) : null;
    },
    // Read while the focus is forced: the ring box, how far an icon-only control's glyph sits off
    // that box's centre, and how much room the ring leaves its text.
    geometry(id) {
      const el = document.querySelector('[data-sweep-id="' + id + '"]');
      if (!el) return null;
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      const out = {
        w: +box.width.toFixed(1),
        h: +box.height.toFixed(1),
        outlined: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0,
        outlineOffset: parseFloat(style.outlineOffset),
        textGap: null,
        glyphOffset: null,
      };
      // The ring's inner edge sits outline-offset outside the border box; a gap under 1px means
      // the ring touches or covers the first or last glyph.
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let left = Infinity;
      let right = -Infinity;
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          left = Math.min(left, rect.left);
          right = Math.max(right, rect.right);
        }
      }
      // Clamped to the box: text an overflow hides is not under the ring.
      if (left < right) {
        const offset = parseFloat(style.outlineOffset);
        out.textGap = +Math.min(
          Math.max(left, box.left) - (box.left - offset),
          box.right + offset - Math.min(right, box.right),
        ).toFixed(1);
      }
      const svgs = el.querySelectorAll('svg');
      if (svgs.length === 1 && !(el.textContent ?? '').trim() && el.matches('button, a, [role="button"]')) {
        const svg = svgs[0];
        const frame = svg.getBoundingClientRect();
        const view = svg.viewBox.baseVal;
        const scale = view && view.width ? frame.width / view.width : 1;
        const bbox = svg.getBBox();
        const cx = frame.x + (bbox.x - (view ? view.x : 0) + bbox.width / 2) * scale;
        const cy = frame.y + (bbox.y - (view ? view.y : 0) + bbox.height / 2) * scale;
        out.glyphOffset = {
          dx: +(cx - (box.x + box.width / 2)).toFixed(1),
          dy: +(cy - (box.y + box.height / 2)).toFixed(1),
        };
      }
      return out;
    },
    // The ring animates in from a TRANSPARENT outline-color, so a read at frame 0 sees
    // rgba(0,0,0,0) and scores a live indicator as a gap. Freezing is cheaper than a 500ms settle
    // per element, and the keyframe declares only its FROM value.
    freezeMotion() {
      document.getElementById('sweep-freeze')?.remove();
      const style = document.createElement('style');
      style.id = 'sweep-freeze';
      style.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; }';
      document.head.appendChild(style);
      return true;
    },
    // Negative control: an element that genuinely cannot show an indicator.
    plantBareControl() {
      document.getElementById('sweep-bare')?.remove();
      const probe = document.createElement('button');
      probe.id = 'sweep-bare';
      probe.textContent = 'bare probe';
      probe.setAttribute('style', 'all: unset; outline: none !important; box-shadow: none !important; position: fixed; top: 0; left: 0; z-index: 2147483647;');
      document.body.appendChild(probe);
      return true;
    },
  };
})();
true;
`;

const diff = (before, after) => {
  const changes = [];
  for (
    let level = 0;
    level < Math.max(before.length, after.length);
    level += 1
  ) {
    const a = before[level] ?? {};
    const b = after[level] ?? {};
    for (const prop of Object.keys(b)) {
      if (prop === '_pseudo') continue;
      if (a[prop] !== b[prop]) {
        changes.push({
          level,
          pseudo: b._pseudo,
          prop,
          from: a[prop],
          to: b[prop],
        });
      }
    }
  }
  return changes;
};

const painted = (value) =>
  value &&
  value !== 'none' &&
  value !== '0px' &&
  !/rgba\(0, 0, 0, 0\)/.test(value);

// A ds-docs demo can PIN a focus state, so the ring is already painted at rest and forcing changes
// nothing. A resting ring is checked before a no-change verdict is believed.
const restingRing = (before) =>
  before.some(
    (level) =>
      (level['outline-style'] !== 'none' && painted(level['outline-width'])) ||
      painted(level['box-shadow']),
  );

// A gap has to be reported with the mechanism it was looked for in, or the next reader repeats the
// measurement. Kept on the row so the JSON carries it.
const PROP_FAMILIES =
  'outline · box-shadow · border · background · colour · pseudo width/content';

const classify = (changes) => {
  const outline = changes.find(
    (c) => c.prop === 'outline-style' && painted(c.to) && c.to !== 'none',
  );
  if (outline)
    return outline.to === 'auto' ? 'browser-auto-outline' : 'outline';

  const outlineWidth = changes.find(
    (c) => c.prop === 'outline-width' && painted(c.to) && !painted(c.from),
  );
  if (outlineWidth) return 'outline';

  const shadow = changes.find((c) => c.prop === 'box-shadow' && painted(c.to));
  if (shadow) return 'shadow-halo';

  const border = changes.find(
    (c) =>
      (c.prop === 'border-top-color' || c.prop === 'border-top-width') &&
      c.from !== c.to,
  );
  if (border) return 'border-only';

  // A pseudo-element that gains a colour or grows is a real indicator drawn by the component —
  // graded apart from the two families so the report says which mechanism answered.
  const pseudo = changes.find(
    (c) =>
      c.pseudo &&
      c.pseudo !== 'element' &&
      [
        'background-color',
        'width',
        'border-top-color',
        'border-top-width',
        'content',
      ].includes(c.prop),
  );
  if (pseudo) return 'pseudo-element';

  const other = changes.find((c) =>
    [
      'background-color',
      'color',
      'text-decoration-line',
      'filter',
      'opacity',
    ].includes(c.prop),
  );
  if (other) return 'weak-channel';

  return 'no-indicator';
};

const sweep = async (url) => {
  await cdp('Page.navigate', { url });
  // Angular hydrates, fonts settle, and the group page lazy-loads its chunk.
  await sleep(3500);
  await evaluate(INSTALL);
  await evaluate('window.__sweep.freezeMotion()');
  await evaluate('window.__sweep.plantBareControl()');
  const rows = await evaluate('window.__sweep.tag()');

  const { root } = await cdp('DOM.getDocument', { depth: 0 });
  const results = [];

  for (const row of rows) {
    const before = await evaluate(
      `JSON.stringify(window.__sweep.signature(${row.sweepId}))`,
    );
    if (!before) continue;

    const { nodeId } = await cdp('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: `[data-sweep-id="${row.sweepId}"]`,
    });
    if (!nodeId) continue;

    await evaluate(`window.__sweep.markChain(${row.sweepId})`);
    const { nodeIds: ancestorIds = [] } = await cdp('DOM.querySelectorAll', {
      nodeId: root.nodeId,
      selector: '[data-sweep-anc]',
    });

    await Promise.all([
      cdp('CSS.forcePseudoState', {
        nodeId,
        forcedPseudoClasses: ['focus', 'focus-visible', 'focus-within'],
      }),
      ...ancestorIds.map((id) =>
        cdp('CSS.forcePseudoState', {
          nodeId: id,
          forcedPseudoClasses: ['focus-within'],
        }),
      ),
    ]);
    const after = await evaluate(
      `JSON.stringify(window.__sweep.signature(${row.sweepId}))`,
    );
    const geometry = await evaluate(`window.__sweep.geometry(${row.sweepId})`);
    await Promise.all([
      cdp('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] }),
      ...ancestorIds.map((id) =>
        cdp('CSS.forcePseudoState', { nodeId: id, forcedPseudoClasses: [] }),
      ),
    ]);

    let name = null;
    let axRole = null;
    try {
      const { nodes } = await cdp('Accessibility.getPartialAXTree', {
        nodeId,
        fetchRelatives: false,
      });
      const own = nodes?.[0];
      name = own?.name?.value ?? null;
      axRole = own?.role?.value ?? null;
      if (own?.ignored)
        axRole = `ignored:${own.ignoredReasons?.[0]?.name ?? '?'}`;
    } catch {
      /* an element removed between tag and read — reported as null */
    }

    const changes = diff(JSON.parse(before), JSON.parse(after));
    results.push({
      url,
      ...row,
      name,
      axRole,
      verdict: (() => {
        const verdict = classify(changes);
        if (verdict !== 'no-indicator') return verdict;
        return restingRing(JSON.parse(before))
          ? 'ringed-at-rest'
          : 'no-indicator';
      })(),
      geometry,
      changes: changes.slice(0, 6),
      resting:
        classify(changes) === 'no-indicator'
          ? JSON.parse(before)[0]
          : undefined,
    });
  }
  return results;
};

const all = [];
for (const url of URLS) {
  const path = url.replace(ORIGIN, '');
  const rows = await sweep(url);
  const bare = rows.find((r) => r.id === 'sweep-bare');
  const control = rows.find(
    (r) => r.component === 'ds-checkbox' && r.tag === 'input',
  );
  const field = rows.find(
    (r) => r.component === 'ds-input' && r.tag === 'input' && !r.disabled,
  );
  console.log(
    `${path}  ${rows.length} focusable  |  bare probe: ${bare ? bare.verdict : 'MISSING'}` +
      `  |  checkbox row: ${control ? control.verdict : 'n/a'}` +
      `  |  text field: ${field ? field.verdict : 'n/a'}`,
  );
  all.push(...rows.filter((r) => r.id !== 'sweep-bare'));
}

writeFileSync(join(SCRATCH, 'focus-sweep.json'), JSON.stringify(all, null, 2));

const byVerdict = new Map();
for (const row of all)
  byVerdict.set(row.verdict, (byVerdict.get(row.verdict) ?? 0) + 1);
console.log(
  `\n${all.length} focusable element(s) across ${URLS.length} page(s)`,
);
for (const [verdict, count] of [...byVerdict].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(count).padStart(4)}  ${verdict}`);
}

// A disabled control is not focusable, so 2.4.7 has nothing to ask of it — two of the eight the
// first clean run reported were a disabled autocomplete and a disabled stepper.
const gaps = all.filter(
  (r) =>
    !r.disabled &&
    (r.verdict === 'no-indicator' || r.verdict === 'weak-channel'),
);
console.log(`\n── ${gaps.length} without an outline or a halo ──`);
const seen = new Set();
for (const gap of gaps) {
  const key = `${gap.component ?? gap.hostTag}|${gap.tag}.${gap.classes}|${gap.verdict}`;
  if (seen.has(key)) continue;
  seen.add(key);
  console.log(
    `  ${gap.verdict.padEnd(14)} ${gap.component ?? '(docs)'} ${gap.tag}.${gap.classes || '—'}`,
  );
  console.log(
    `                 name=${JSON.stringify(gap.name)} role=${gap.axRole} at ${gap.url}`,
  );
}

const unnamed = all.filter(
  (r) =>
    !r.disabled &&
    (!r.name || !r.name.trim()) &&
    !String(r.axRole ?? '').startsWith('ignored'),
);
console.log(
  `\n── ${unnamed.length} focusable element(s) with NO accessible name ──`,
);
const seenNames = new Set();
for (const row of unnamed) {
  const key = `${row.component ?? row.hostTag}|${row.tag}.${row.classes}`;
  if (seenNames.has(key)) continue;
  seenNames.add(key);
  console.log(
    `  ${(row.component ?? '(docs)').padEnd(22)} ${row.tag}.${row.classes || '—'} role=${row.axRole} at ${row.url}`,
  );
}

// Half a pixel is antialiasing; past it the glyph visibly leaves the middle of its ring.
const offCentre = all.filter(
  (r) =>
    r.geometry?.glyphOffset &&
    Math.max(
      Math.abs(r.geometry.glyphOffset.dx),
      Math.abs(r.geometry.glyphOffset.dy),
    ) > 0.5,
);
// WCAG 2.5.8 also passes a smaller target with 24px of spacing, which this does not measure:
// the list is where to look, not a list of failures.
const small = all.filter(
  (r) =>
    !r.disabled &&
    r.geometry?.glyphOffset &&
    (r.geometry.w < 24 || r.geometry.h < 24),
);
const ringOnText = all.filter(
  (r) =>
    r.geometry?.outlined &&
    r.geometry.textGap !== null &&
    r.geometry.textGap < 1,
);
const listOnce = (rows, title, detail) => {
  console.log(`\n-- ${rows.length} ${title} --`);
  const seenRows = new Set();
  for (const row of rows) {
    const key = `${row.component ?? row.hostTag}|${row.tag}.${row.classes}`;
    if (seenRows.has(key)) continue;
    seenRows.add(key);
    console.log(
      `  ${(row.component ?? '(docs)').padEnd(22)} ${row.tag}.${row.classes || '-'} ${detail(row)} at ${row.url}`,
    );
  }
};
listOnce(
  offCentre,
  'icon-only control(s) with the glyph off the box centre',
  (r) => `dx=${r.geometry.glyphOffset.dx} dy=${r.geometry.glyphOffset.dy}`,
);
listOnce(
  small,
  'icon-only control(s) under 24x24',
  (r) => `${r.geometry.w}x${r.geometry.h}`,
);
listOnce(
  ringOnText,
  'ring(s) touching or covering their text',
  (r) =>
    `gap=${r.geometry.textGap}px outline-offset=${r.geometry.outlineOffset}px`,
);

socket.close();
chrome.kill();
