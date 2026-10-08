// Measures, in a built ds-docs, how many CSS px of a line of text a DS box clips vertically while
// the line's own box fits inside it, under four fonts: the DS font, a tall one, one with a very deep
// descent, and the DS font with every line-height token at 1.
//
//   node tools/measure-glyph-clip.mjs <baseUrl> [outDir] [shotsFrom]
//   DS_THEME=dark node tools/measure-glyph-clip.mjs ...    # the same in the dark theme
//
// Serve the build first (`node tools/serve-static.mjs <build>/browser 4610`). With outDir it writes
// `glyph-clip.json` and a webp of the clipping component for the worst line of each component and
// font. `shotsFrom` is an earlier run's `glyph-clip.json`: the same components are shot again,
// clipped or not, which is how a before run and an after run pair up, and the width and height of
// every `ds-*` element are compared with that run's, so a fix that moved a box is reported. Exit
// code 1 when any text is clipped or any box moved.
//
// A line's glyph box is its Range rect, which spans the font's ascent and descent, so the figure
// holds for whatever font a consumer sets through `--font-sans`; ink drawn past the font's own
// ascent is not seen. The line box is the parent's `line-height` centred on that rect. A clip
// that cuts the line box too is content overflowing its frame (a short demo, a collapsed panel,
// a clamp's hidden line), not this defect, and is not counted; neither is overflow
// `auto`/`scroll`. A box counts only when a DS component's template owns it. A form control's
// value is measured against its padding box, since it sits in the browser's own inner editor.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { open, wait } from './headless-chrome.mjs';

const [baseUrl, outDir, shotsFrom] = process.argv.slice(2);
if (!baseUrl) {
  console.error(
    'usage: node tools/measure-glyph-clip.mjs <baseUrl> [outDir] [shotsFrom]',
  );
  process.exit(2);
}

const PAGES = [
  '/components/button',
  '/components/autocomplete',
  '/components/app-layout',
  '/components/accordion',
  '/components/alert',
  '/components/bottom-sheet',
  '/components/filter-bar',
  '/charts/bar-chart',
];

// Ascent plus descent in Chrome on Windows: Mulish 1.26em, Segoe Script 1.59em, Javanese Text
// 2.27em with a 1.02em descent. A font that is not installed falls back silently, so the run
// prints the span it actually measured.
export const FONTS = {
  ds: '',
  tall: ':root { --font-sans: "Segoe Script", cursive !important; }',
  deep: ':root { --font-sans: "Javanese Text", serif !important; }',
  narrow:
    ':root { --line-height-flat: 1 !important; --line-height-tight: 1 !important; --line-height-snug: 1 !important; --line-height-base: 1 !important; --line-height-loose: 1 !important; }',
};

const SAMPLE = 'gjpqyЙЁÅÇ';

const settle = `for (const animation of document.getAnimations()) {
  if (animation.effect?.getTiming().iterations === Infinity) { animation.pause(); animation.currentTime = 0; }
  else animation.finish();
}`;

const measure = `() => {
  ${settle}
  const sample = ${JSON.stringify(SAMPLE)};
  let cursor = 0;
  const dsHostOf = (element) => {
    for (let at = element; at; at = at.parentElement) if (at.tagName.startsWith('DS-')) return at;
    return null;
  };
  const owned = (element) => {
    if (element.tagName.startsWith('DS-')) return true;
    const content = [...element.attributes].find((attribute) => attribute.name.startsWith('_ngcontent-'));
    if (!content) return false;
    const host = element.closest('[_nghost-' + content.name.slice('_ngcontent-'.length) + ']');
    return !!host && host.tagName.startsWith('DS-');
  };
  const walker = document.createTreeWalker(document.querySelector('main') ?? document.body, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const dsHost = dsHostOf(node.parentElement);
    if (!dsHost || !/\\p{L}/u.test(node.data)) continue;
    node.data = node.data.replace(/\\p{L}/gu, () => sample[cursor++ % sample.length]);
    texts.push([node, dsHost]);
  }
  void document.body.offsetHeight;

  const describe = (element) => {
    let text = element.tagName.toLowerCase();
    const classes = typeof element.className === 'string' ? element.className.trim().split(/\\s+/).filter((name) => name && !name.startsWith('ng-')).slice(0, 2) : [];
    if (classes.length) text += '.' + classes.join('.');
    return text;
  };
  // Past a vertical scroller, a box's position depends on how far it is scrolled, not on its layout.
  const scrolls = (element) => /auto|scroll/.test(getComputedStyle(element).overflowY);
  const clipBox = (element, eitherAxis = false) => {
    const style = getComputedStyle(element);
    const clips = (value) => value === 'hidden' || value === 'clip';
    if (eitherAxis ? !clips(style.overflowX) && !clips(style.overflowY) : style.overflowY !== 'hidden' && style.overflowY !== 'clip') return null;
    const rect = element.getBoundingClientRect();
    if (!eitherAxis && (rect.height <= 2 || rect.width <= 2)) return null;
    const isHtml = element instanceof HTMLElement;
    let top = isHtml ? rect.top + element.clientTop : rect.top;
    let bottom = isHtml ? top + element.clientHeight : rect.bottom;
    let left = isHtml ? rect.left + element.clientLeft : rect.left;
    let right = isHtml ? left + element.clientWidth : rect.right;
    if (style.overflowY === 'clip' || style.overflowX === 'clip') {
      const margin = parseFloat(style.overflowClipMargin) || 0;
      top -= margin; bottom += margin; left -= margin; right += margin;
    }
    return { top, bottom, left, right, x: clips(style.overflowX), y: clips(style.overflowY) };
  };

  const hits = [];
  let measured = 0;
  const record = (dsHost, clipper, line, top, bottom, text, rect) => {
    const origin = dsHost.getBoundingClientRect();
    const frame = clipper.getBoundingClientRect();
    const left = Math.max(frame.left, rect.left) - 12;
    const right = Math.min(frame.right, rect.right) + 12;
    const crop = { x: left - origin.left, y: rect.top - 14 - origin.top, width: Math.min(right - left, 640), height: rect.height + 28 };
    hits.push({ crop, component: dsHost.tagName.toLowerCase(), index: [...document.getElementsByTagName(dsHost.tagName)].indexOf(dsHost), clipper: describe(clipper), clipped: Math.round((top + bottom) * 10) / 10, top: Math.round(top * 10) / 10, bottom: Math.round(bottom * 10) / 10, lineHeight: Math.round(line * 10) / 10, text: text.slice(0, 24) });
  };

  for (const [node, dsHost] of texts) {
    const range = document.createRange();
    range.selectNodeContents(node);
    const lineHeight = parseFloat(getComputedStyle(node.parentElement).lineHeight);
    for (const rect of range.getClientRects()) {
      if (rect.height < 1 || rect.width < 1) continue;
      const middle = (rect.top + rect.bottom) / 2;
      const half = (Number.isNaN(lineHeight) ? rect.height : lineHeight) / 2;
      let hidden = false;
      for (let at = node.parentElement; at && !hidden && !scrolls(at); at = at.parentElement) {
        const box = clipBox(at, true);
        hidden = !!box && ((box.y && (rect.bottom <= box.top || rect.top >= box.bottom)) || (box.x && (rect.right <= box.left || rect.left >= box.right)));
      }
      if (hidden) continue;
      measured += 1;
      for (let at = node.parentElement; at && !scrolls(at); at = at.parentElement) {
        if (!owned(at)) continue;
        const box = clipBox(at);
        if (!box) continue;
        if (rect.right <= box.left || rect.left >= box.right) continue;
        if (middle - half < box.top - 0.5 || middle + half > box.bottom + 0.5) continue;
        const top = Math.max(0, box.top - rect.top);
        const bottom = Math.max(0, rect.bottom - box.bottom);
        if (top + bottom < 0.5 || top + bottom >= rect.height) continue;
        record(dsHost, at, rect.height, top, bottom, node.data.trim(), rect);
      }
    }
  }

  const probe = document.createElement('span');
  probe.textContent = sample;
  document.body.append(probe);
  for (const control of document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=file])')) {
    const dsHost = dsHostOf(control);
    if (!dsHost || control.offsetHeight === 0) continue;
    if (!control.value && !control.placeholder) continue;
    const swap = (text) => text.replace(/\\p{L}/gu, () => sample[cursor++ % sample.length]);
    if (control.value) control.value = swap(control.value);
    else control.placeholder = swap(control.placeholder);
    const style = getComputedStyle(control);
    probe.style.font = style.font;
    probe.style.lineHeight = 'normal';
    const span = probe.getBoundingClientRect().height;
    const overflow = span - control.clientHeight;
    if (overflow >= 0.5) record(dsHost, control, span, overflow / 2, overflow / 2, control.value || control.placeholder, control.getBoundingClientRect());
  }
  probe.remove();
  const boxes = [...document.querySelector('main').querySelectorAll('*')]
    .filter((element) => element.tagName.startsWith('DS-'))
    .map((element) => { const rect = element.getBoundingClientRect(); return element.tagName.toLowerCase() + ' ' + Math.round(rect.width * 2) / 2 + 'x' + Math.round(rect.height * 2) / 2; });
  return { hits, measured, boxes };
}`;

// The docs hold a deep link's section in place until the reader scrolls, and build a chart only
// once it has been on screen, so the page is walked end to end before anything is measured.
const walkPage = `async () => {
  const main = document.querySelector('main.content') ?? document.scrollingElement;
  main.dispatchEvent(new WheelEvent('wheel'));
  for (let top = 0; top < main.scrollHeight; top += main.clientHeight / 2) {
    main.scrollTop = top;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  main.scrollTop = 0;
  await new Promise((resolve) => setTimeout(resolve, 1500));
}`;

const spanOf = `async () => { await document.fonts.ready; const s = document.createElement('span'); s.style.font = '100px var(--font-sans)'; s.textContent = 'gjpqy'; document.body.append(s); const range = document.createRange(); range.selectNodeContents(s); const height = range.getBoundingClientRect().height / 100; s.remove(); return height; }`;

async function shoot(s, evaluate, { component, index, crop }, file) {
  const find = `document.getElementsByTagName(${JSON.stringify(component)})[${index}]`;
  const found = await evaluate(
    `() => { const element = ${find}; if (!element) return false; for (let scroller = element.parentElement; scroller; scroller = scroller.parentElement) { if (scroller.scrollHeight > scroller.clientHeight && /auto|scroll/.test(getComputedStyle(scroller).overflowY)) { const top = element.getBoundingClientRect().top - scroller.getBoundingClientRect().top; scroller.scrollTop += top - scroller.clientHeight / 3; } } return true; }`,
  );
  if (!found) return null;
  await wait(400);
  const rect = await evaluate(
    `() => { ${settle} const origin = ${find}.getBoundingClientRect(); return { x: Math.max(0, origin.left + ${crop.x}), y: Math.max(0, origin.top + ${crop.y}), width: ${crop.width}, height: ${crop.height} }; }`,
  );
  if (rect.width < 4 || rect.height < 4) return null;
  const { data } = await s('Page.captureScreenshot', {
    format: 'webp',
    quality: 80,
    clip: { ...rect, scale: 2 },
  });
  writeFileSync(file, Buffer.from(data, 'base64'));
  return file;
}

const worstOf = (hits) => {
  const worst = new Map();
  for (const hit of hits) {
    const key = `${hit.font}	${hit.component}	${hit.clipper}`;
    const entry = worst.get(key) ?? { ...hit, lines: 0 };
    entry.lines += 1;
    if (hit.clipped > entry.clipped)
      Object.assign(entry, hit, { lines: entry.lines });
    worst.set(key, entry);
  }
  return [...worst.values()];
};

const previous = shotsFrom ? JSON.parse(readFileSync(shotsFrom, 'utf8')) : null;
const wanted = shotsFrom ? previous.summary : null;
const theme = process.env.DS_THEME || 'light';
const result = { baseUrl, theme, fonts: {}, hits: [], measured: 0, boxes: {} };
const moved = [];
if (outDir) mkdirSync(outDir, { recursive: true });

for (const [font, css] of Object.entries(FONTS)) {
  for (const page of PAGES) {
    const inject = css
      ? `document.addEventListener('DOMContentLoaded', () => { const style = document.createElement('style'); style.textContent = ${JSON.stringify(css)}; document.head.append(style); });`
      : '';
    const { s, evaluate, close } = await open(baseUrl + page, {
      initScript: inject,
    });
    try {
      await wait(7000);
      await evaluate(walkPage);
      await evaluate(
        `() => { document.documentElement.dataset.theme = '${theme}'; }`,
      );
      result.fonts[font] ??= await evaluate(spanOf);
      const run = await evaluate(measure);
      const hits = run.hits.map((hit) => ({ font, page, ...hit }));
      result.hits.push(...hits);
      result.measured += run.measured;
      result.boxes[`${font} ${page}`] = run.boxes;
      const before = previous?.boxes?.[`${font} ${page}`];
      if (before) {
        if (before.length !== run.boxes.length)
          moved.push(
            `${font} ${page}: ${before.length} ds-* elements, now ${run.boxes.length}`,
          );
        else
          run.boxes.forEach((box, index) => {
            if (box !== before[index])
              moved.push(
                `${font} ${page}: #${index} ${before[index]} -> ${box}`,
              );
          });
      }
      if (!outDir) continue;
      const targets = (wanted ?? worstOf(hits)).filter(
        (entry) => entry.font === font && entry.page === page,
      );
      for (const target of targets) {
        target.shot = await shoot(
          s,
          evaluate,
          target,
          join(
            outDir,
            `${target.component}-${target.index}-${target.clipper.replace(/[^a-z0-9-]+/g, '-')}.${font}.${theme}.webp`,
          ),
        );
      }
    } finally {
      await close();
    }
  }
}

result.summary = worstOf(result.hits);
console.log(
  `fonts (ascent+descent in em): ${Object.entries(result.fonts)
    .map(([name, span]) => `${name} ${span.toFixed(3)}`)
    .join(', ')}`,
);
for (const entry of result.summary)
  console.log(
    `${entry.font.padEnd(6)} ${(entry.component + '#' + entry.index).padEnd(24)} ${entry.clipper.padEnd(32)} max ${String(entry.clipped).padStart(5)} px of ${entry.lineHeight} (top ${entry.top}, bottom ${entry.bottom}) over ${entry.lines} line(s)`,
  );
if (previous) {
  console.log(
    `boxes: ${Object.values(result.boxes).flat().length} ds-* elements compared with ${shotsFrom}, ${moved.length} changed size`,
  );
  for (const line of moved.slice(0, 40)) console.log(`  ${line}`);
}
console.log(
  `measure-glyph-clip: ${result.hits.length} clipped of ${result.measured} line(s) measured across ${PAGES.length} pages x ${Object.keys(FONTS).length} fonts, ${theme} theme.`,
);
if (outDir)
  writeFileSync(
    join(outDir, 'glyph-clip.json'),
    JSON.stringify(result, null, 2),
  );
process.exit(result.hits.length || moved.length ? 1 : 0);
