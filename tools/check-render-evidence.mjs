#!/usr/bin/env node
// A release that changes how the library RENDERS must say so, and a "renders identically" backed
// by `pixels:<block id>` must be true. This check builds ds-docs at two refs, screenshots every
// docs block in headless Chrome at a fixed viewport, and lists the blocks whose pixels differ.
//
// A block is one `h3.block-title` chapter of a `section[data-anchor]`, from its heading to the
// next one, plus the section's intro above its first heading. Its id is `<anchor>/<chapter slug>`
// (`button/sizes`), the intro's is `<anchor>`, a repeated title gets `~2`, `~3`.
//
// It fails when
//   * a differing block names nothing the manifest text or the CHANGELOG block names: a `ds-*`
//     element or `ds-*` class rendered inside it, the component class of such an element, or a
//     `--ds-*` token its text prints, and no custom property its elements read at the base side,
//     in a `var()` of a matching style rule or inline style, is the `old` of a `removed-api` or
//     `token-rename` item of the manifest (a family `old` expanded as the stylelint deprecation
//     list expands it). A docs stylesheet reading a withdrawn token loses that colour with
//     nothing of the library in its markup;
//   * a `pixels:<block id>` evidence entry of that manifest names no block, or one that differs.
//
// The "to" build is the docs app of the FROM ref compiled against the library of the TO ref, so a
// docs-only edit (a demo rewritten, a paragraph added) does not read as a library change. When
// that hybrid does not compile, because the old docs use an API the new library removed, both
// sides fall back to their own docs and the run says so.
//
// Rendering is pinned so a block differs only when its pixels do: a 1440x900 viewport at scale 1,
// `prefers-reduced-motion: reduce`, light scheme, hidden scrollbars and carets, `document.fonts`
// settled (every face is bundled), infinite animations paused at zero and finite ones finished,
// software raster on one thread (RASTER_FLAGS). Two blocks are equal when their PNGs are equal
// byte for byte, or when they differ only as antialiasing does: no channel more than
// ANTIALIAS_CHANNEL_DELTA apart, on at most ANTIALIAS_PIXEL_SHARE of the block's pixels.
// A block that only moved down the page is not one: a differing block whose document top differs
// is captured again with the higher side pushed down to the other's top, and compared once more.
//
// A build of two committed trees is cached under the git common directory
// (`render-evidence-cache/`, or DS_RENDER_EVIDENCE_CACHE), so every worktree of the repository
// shares it and a tag is built once. A build that includes the working tree is cached under this
// checkout's node_modules/.cache/render-evidence/, and a stale one is removed on the next run.
// A build is published by renaming a finished copy into place, so a run never serves a
// half-written one and two runs building the same tree do not clobber each other.
//
// With --affected only the blocks that render a component whose `src/lib/components/<name>/`
// changed between the two refs are screenshotted; the others are listed as skipped. A change in
// `src/` outside a component folder (styles, tokens, core) cannot be mapped to blocks, so the run
// is the full one. The run without the flag is the release gate.
//
//   node tools/check-render-evidence.mjs                       # last tag vs working tree, fails
//   node tools/check-render-evidence.mjs --from v0.14.7 --to v0.14.8   # history, reports only
//   ... --dists <fromDir> <toDir> --pages /a,/b                # two prebuilt sites (the selftest)
//   ... --affected                                             # screenshot only blocks of changed components
//   ... --crops <dir>                                          # write before/after PNGs of each differing block
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  cpSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import http from 'node:http';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { candidatesOf } from './generate-token-deprecations.mjs';
import { open, wait } from './headless-chrome.mjs';
import { previousBoundary, releaseTags } from './release-tags.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATIONS = process.env.DS_MIGRATIONS_DIR || join(ROOT, 'migrations');
const CHANGELOG = process.env.DS_CHANGELOG_PATH || join(ROOT, 'CHANGELOG.md');
const CACHE = join(ROOT, 'node_modules/.cache/render-evidence');
const SHARED_CACHE =
  process.env.DS_RENDER_EVIDENCE_CACHE ||
  join(
    resolve(
      ROOT,
      execFileSync('git', ['-C', ROOT, 'rev-parse', '--git-common-dir'], {
        encoding: 'utf8',
      }).trim(),
    ),
    'render-evidence-cache',
  );
const DOCS_PATHS = [
  'angular.json',
  'tsconfig.json',
  'package.json',
  'CHANGELOG.md',
  'design-system.md',
  'ds-docs',
];
const LIBRARY_PATHS = ['src'];
const NAV_CONFIG = 'ds-docs/src/app/core/nav.config.ts';
// The changelog page renders CHANGELOG.md, which every release edits; it shows no component.
const SKIPPED_PAGES = new Set(['/changelog']);
const VIEWPORT = { width: 1440, height: 900 };
// Software raster on one thread, in sRGB, with grayscale unhinted text. With GPU raster, LCD text
// or parallel raster tiles, the same build antialiased 58 of 714 blocks differently from itself.
const RASTER_FLAGS = [
  '--disable-gpu',
  '--force-color-profile=srgb',
  '--disable-lcd-text',
  '--font-render-hinting=none',
  '--num-raster-threads=1',
  '--disable-partial-raster',
];
const PAGE_SETTLE_MS = 1500;
const SCROLL_SETTLE_MS = 250;
// ponytail: a block taller than this many viewports is compared on its top part only; a table
// demo of thousands of rows would otherwise cost minutes. Raise it if a long block hides a change.
const MAX_CHUNKS = 12;

const argv = process.argv.slice(2);
const option = (name, count = 1) => {
  const index = argv.indexOf(name);
  if (index === -1) return null;
  const values = argv.slice(index + 1, index + 1 + count);
  if (values.length < count || values.some((value) => value.startsWith('--')))
    fail(`${name} needs ${count} value(s)`);
  return count === 1 ? values[0] : values;
};
function fail(message) {
  console.error(`check-render-evidence: ${message}`);
  process.exit(2);
}

const git = (args, options = {}) =>
  execFileSync('git', ['-C', ROOT, ...args], {
    encoding: 'utf8',
    maxBuffer: 1 << 30,
    ...options,
  });

// The working tree as a git tree object, untracked files included, through a private index so the
// real one is not touched.
function workingTree() {
  const index = join(ROOT, 'tmp', `render-evidence-index-${process.pid}`);
  mkdirSync(dirname(index), { recursive: true });
  const env = { ...process.env, GIT_INDEX_FILE: index };
  try {
    git(['read-tree', 'HEAD'], { env });
    git(['add', '-A', '--', ...DOCS_PATHS, ...LIBRARY_PATHS], { env });
    return git(['write-tree'], { env }).trim();
  } finally {
    rmSync(index, { force: true });
  }
}

const treeOf = (ref) =>
  ref ? git(['rev-parse', `${ref}^{tree}`]).trim() : workingTree();

// Builds the docs of `docsTree` against the library of `libraryTree` and returns the directory of
// the built site, reusing a cached build of the same pair of trees.
function buildDocs(docsTree, libraryTree, label, committed) {
  const cache = committed ? SHARED_CACHE : CACHE;
  const listing =
    git(['ls-tree', docsTree, '--', ...DOCS_PATHS]) +
    git(['ls-tree', libraryTree, '--', ...LIBRARY_PATHS]);
  const key = createHash('sha1').update(listing).digest('hex').slice(0, 16);
  const output = join(cache, key);
  if (existsSync(join(output, 'index.html'))) {
    console.log(`  ${label}: cached build ${key}`);
    return { dir: output, key };
  }
  // Under tmp/ rather than the cache: esbuild ignores tsconfig `paths` for a file inside
  // node_modules, and the docs import the library through them. node_modules still resolves by
  // walking up to the repository root.
  const source = join(ROOT, 'tmp', `render-evidence-${key}`);
  rmSync(source, { recursive: true, force: true });
  mkdirSync(source, { recursive: true });
  const started = Date.now();
  try {
    for (const [tree, paths] of [
      [docsTree, DOCS_PATHS],
      [libraryTree, LIBRARY_PATHS],
    ])
      execFileSync('tar', ['-x'], {
        cwd: source,
        input: git(['archive', tree, '--', ...paths], { encoding: 'buffer' }),
      });
    const build = spawnSync(
      process.execPath,
      [join(ROOT, 'node_modules/@angular/cli/bin/ng.js'), 'build', 'ds-docs'],
      { cwd: source, encoding: 'utf8', env: { ...process.env, CI: 'true' } },
    );
    if (build.status !== 0) {
      console.log(
        `  ${label}: build failed\n${`${build.stdout}${build.stderr}`.trim().split('\n').slice(-12).join('\n')}`,
      );
      return null;
    }
    mkdirSync(cache, { recursive: true });
    const staged = join(cache, `.staging-${key}-${process.pid}`);
    try {
      cpSync(join(source, 'dist/ds-docs/browser'), staged, { recursive: true });
      try {
        renameSync(staged, output);
      } catch (error) {
        if (!existsSync(join(output, 'index.html'))) {
          throw error;
        }
      }
    } finally {
      rmSync(staged, { recursive: true, force: true });
    }
    console.log(
      `  ${label}: built ${key} in ${Math.round((Date.now() - started) / 1000)} s`,
    );
    return { dir: output, key };
  } finally {
    rmSync(source, { recursive: true, force: true });
  }
}

// One URL per nav group: `/` for Start, `/<area>/<first anchor>` for the rest.
function pagesOf(tree) {
  const source = tree
    ? git(['show', `${tree}:${NAV_CONFIG}`])
    : readFileSync(join(ROOT, NAV_CONFIG), 'utf8');
  const pages = [];
  for (const [, path, anchor] of source.matchAll(
    /path:\s*'([^']*)'[\s\S]*?anchor:\s*'([^']+)'/g,
  ))
    pages.push(
      path === '' || path === 'changelog'
        ? `/${path}`
        : `/${path.split('/')[0]}/${anchor}`,
    );
  return pages.filter((page) => !SKIPPED_PAGES.has(page));
}

const CONTENT_TYPES = {
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

async function serve(root) {
  const server = http.createServer((request, response) => {
    let file = join(root, decodeURIComponent(request.url.split('?')[0]));
    if (!file.startsWith(root)) return response.writeHead(403).end();
    if (!existsSync(file) || statSync(file).isDirectory())
      file = join(root, 'index.html');
    response.writeHead(200, {
      'content-type':
        CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
    });
    createReadStream(file).pipe(response);
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  return server;
}

const SETTLE_ANIMATIONS = `for (const animation of document.getAnimations()) {
  if (animation.effect?.getTiming().iterations === Infinity) { animation.pause(); animation.currentTime = 0; }
  else animation.finish();
}`;

// Collects the blocks of the page into window.__renderBlocks and returns their ids, names and the
// custom properties their elements read: those in a `var()` of an inline style or of a style rule
// matching the element, a pseudo-element's rule counting for its host.
const COLLECT_BLOCKS = `() => {
  const slug = (text) => text.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const follows = (node, other) => !!(node.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING);
  const variables = (text) => [...(text ?? '').matchAll(/var[(] *(--[a-zA-Z0-9_-]+)/g)].map((match) => match[1]);
  const readsOf = new Map();
  const read = (element, names) => {
    if (!names.length) return;
    if (!readsOf.has(element)) readsOf.set(element, new Set());
    for (const name of names) readsOf.get(element).add(name);
  };
  const visit = (rules) => {
    for (const rule of rules) {
      if (rule.selectorText !== undefined) {
        const names = variables(rule.style?.cssText);
        const selector = rule.selectorText.replace(/::?(before|after|marker|placeholder|first-line|first-letter|selection|backdrop|file-selector-button|-webkit-[a-z-]+)/g, '');
        if (names.length && selector.trim())
          try { for (const element of document.querySelectorAll(selector)) read(element, names); } catch {}
      }
      if (rule.cssRules) visit(rule.cssRules);
    }
  };
  for (const sheet of [...document.styleSheets, ...document.adoptedStyleSheets])
    try { visit(sheet.cssRules); } catch {}
  for (const element of document.querySelectorAll('[style]')) read(element, variables(element.getAttribute('style')));
  const blocks = [];
  const seen = new Map();
  for (const section of document.querySelectorAll('section[data-anchor]')) {
    const anchor = section.dataset.anchor;
    const headings = [...section.querySelectorAll('h3.block-title')];
    const starts = [{ id: anchor, start: null }, ...headings.map((heading) => ({ id: anchor + '/' + slug(heading.textContent), start: heading }))];
    starts.forEach(({ id, start }, index) => {
      const end = starts[index + 1]?.start ?? null;
      const count = (seen.get(id) ?? 0) + 1;
      seen.set(id, count);
      const inside = (element) =>
        (start ? start === element || start.contains(element) || follows(start, element) : true) &&
        (!end || (follows(element, end) && !element.contains(end)));
      const names = new Set();
      const reads = new Set();
      for (const element of section.querySelectorAll('*')) {
        if (!inside(element)) continue;
        for (const name of readsOf.get(element) ?? []) reads.add(name);
        const tag = element.tagName.toLowerCase();
        if (tag.startsWith('ds-')) names.add(tag);
        for (const name of element.classList) if (name.startsWith('ds-')) names.add(name);
      }
      const range = document.createRange();
      if (start) range.setStartBefore(start); else range.setStart(section, 0);
      if (end) range.setEndBefore(end); else range.setEnd(section, section.childNodes.length);
      for (const token of range.toString().match(/--ds-[a-z0-9-]*[a-z0-9]/g) ?? []) names.add(token);
      blocks.push({ id: count > 1 ? id + '~' + count : id, section, start, end, names: [...names].sort(), reads: [...reads].sort() });
    });
  }
  window.__renderBlocks = blocks;
  return blocks.map(({ id, names, reads }) => ({ id, names, reads }));
}`;

// Scrolls block `index` so that its part starting `offset` px below its top is at the top of the
// scroller, and returns the clip of that part in viewport pixels.
const placeBlock = (index, offset) => `() => {
  const block = window.__renderBlocks[${index}];
  const scroller = document.querySelector('main.content') ?? document.scrollingElement;
  const top = () => (block.start ?? block.section).getBoundingClientRect().top;
  const bottom = () => block.end ? block.end.getBoundingClientRect().top : block.section.getBoundingClientRect().bottom;
  const frame = scroller === document.scrollingElement ? { top: 0, bottom: innerHeight } : scroller.getBoundingClientRect();
  const before = scroller.scrollTop;
  scroller.scrollTop += top() + ${offset} - frame.top;
  const moved = Math.abs(scroller.scrollTop - before);
  ${SETTLE_ANIMATIONS}
  const visibleTop = Math.max(frame.top, 0);
  const visible = Math.min(frame.bottom, innerHeight) - visibleTop;
  const height = bottom() - top();
  const sectionBox = block.section.getBoundingClientRect();
  // Whole pixels: a fractional clip is resampled, and the resampling is not stable between runs.
  const y = Math.round(top() + ${offset});
  return { moved, height, visible, documentTop: top() - frame.top + scroller.scrollTop, clip: { x: Math.round(sectionBox.left), y, width: Math.round(sectionBox.width), height: Math.max(0, Math.round(Math.min(visible, height - ${offset}))) } };
}`;

// Pushes block `index` down with a spacer above it until its document top is `target`, and
// returns the top it reached. A spacer shifts the block by its height plus whatever gap the
// container adds, so the height is corrected against a measurement rather than computed.
const alignBlock = (index, target) => `() => {
  const block = window.__renderBlocks[${index}];
  const scroller = document.querySelector('main.content') ?? document.scrollingElement;
  const frame = scroller === document.scrollingElement ? { top: 0 } : scroller.getBoundingClientRect();
  const documentTop = () => (block.start ?? block.section).getBoundingClientRect().top - frame.top + scroller.scrollTop;
  const spacer = document.createElement('div');
  spacer.setAttribute('aria-hidden', 'true');
  spacer.style.height = '0px';
  (block.start ?? block.section).before(spacer);
  window.__renderSpacer = spacer;
  let height = 0;
  for (let attempt = 0; attempt < 5; attempt++) {
    const missing = ${target} - documentTop();
    if (Math.abs(missing) < 0.01 || height + missing < 0) break;
    height += missing;
    spacer.style.height = height + 'px';
  }
  return documentTop();
}`;

// Screenshots block `index` in parts of one viewport, top to bottom.
async function captureBlock({ s, evaluate }, index) {
  const chunks = [];
  let unstable = false;
  let top = null;
  let height = Infinity;
  for (
    let offset = 0, chunk = 0;
    offset < height && chunk < MAX_CHUNKS;
    chunk++
  ) {
    // The docs restore a scroll offset whenever content below grows, and content renders as
    // it enters the viewport, so a placement holds only once a re-placement moves nothing,
    // before and after the screenshot.
    let settled = null;
    let data = null;
    let empty = false;
    for (let attempt = 0; attempt < 10 && !data; attempt++) {
      await evaluate(placeBlock(index, offset));
      await wait(SCROLL_SETTLE_MS);
      settled = await evaluate(placeBlock(index, offset));
      if (settled.moved >= 1) continue;
      empty = settled.clip.height < 1 || settled.clip.width < 1;
      if (empty) break;
      const shot = await s('Page.captureScreenshot', {
        format: 'png',
        clip: { ...settled.clip, scale: 1 },
      });
      if ((await evaluate(placeBlock(index, offset))).moved < 1)
        data = shot.data;
    }
    top ??= settled.documentTop;
    height = settled.height;
    unstable ||= !data && !empty;
    if (!data) break;
    chunks.push(data);
    offset += Math.max(1, settled.visible);
  }
  return { chunks, unstable, top };
}

// With `targets` (block id -> document top), captures only those blocks, each pushed down to its
// target; the blocks above are still placed in order, so whatever renders on entering the
// viewport has rendered as in a full pass.
async function renderSite(dir, pages, targets = null, only = null) {
  const server = await serve(resolve(dir));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await open('about:blank', {
    args: RASTER_FLAGS,
    initScript: `document.addEventListener('DOMContentLoaded', () => { const style = document.createElement('style'); style.textContent = '*, *::before, *::after { caret-color: transparent !important; }'; document.head.append(style); });`,
  });
  const { s, evaluate } = browser;
  const blocks = new Map();
  blocks.skipped = [];
  try {
    await s('Emulation.setDeviceMetricsOverride', {
      ...VIEWPORT,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await s('Emulation.setEmulatedMedia', {
      features: [
        { name: 'prefers-reduced-motion', value: 'reduce' },
        { name: 'prefers-color-scheme', value: 'light' },
      ],
    });
    await s('Emulation.setScrollbarsHidden', { hidden: true });
    for (const page of pages) {
      await s('Page.navigate', { url: base + page });
      await wait(200);
      await evaluate(`async () => {
        while (document.readyState !== 'complete') await new Promise((done) => setTimeout(done, 50));
        await document.fonts.ready;
      }`);
      await wait(PAGE_SETTLE_MS);
      // The docs hold a deep link's section in place for seconds after load, until the reader
      // scrolls; a wheel event is that reader.
      await evaluate(
        `() => document.querySelector('main.content')?.dispatchEvent(new WheelEvent('wheel'))`,
      );
      const found = await evaluate(COLLECT_BLOCKS);
      const wanted = (block) =>
        targets ? targets.has(block.id) : !only || only(block);
      const last = found.findLastIndex(wanted);
      for (const [index, { id, names, reads }] of found.entries()) {
        if (!wanted({ id, names })) {
          blocks.skipped.push({ id, page });
        }
        if (index > last) {
          continue;
        }
        if (!wanted({ id, names })) {
          await evaluate(placeBlock(index, 0));
          await wait(SCROLL_SETTLE_MS);
          continue;
        }
        if (targets) await evaluate(alignBlock(index, targets.get(id)));
        blocks.set(id, {
          page,
          names,
          reads,
          ...(await captureBlock(browser, index)),
        });
        if (targets) await evaluate(`() => window.__renderSpacer.remove()`);
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
  return blocks;
}

// Chrome rasterises curves and glyph edges a level or two apart when a layer elsewhere on the page
// changes size (a table 1 000 000px wide stretches the scroller's layer), which no realignment
// undoes. A tint moved across a whole block exceeds the share, a moved edge exceeds the delta.
const ANTIALIAS_CHANNEL_DELTA = 8;
const ANTIALIAS_PIXEL_SHARE = 0.01;

// Decoded inside a page: PNG decoding and getImageData are native there.
async function antialiasOnly(before, after) {
  const pairs = [...before].flatMap(([id, a]) => {
    const b = after.get(id);
    return b &&
      !a.unstable &&
      !b.unstable &&
      a.chunks.length === b.chunks.length &&
      !samePixels(a, b)
      ? [[id, a.chunks, b.chunks]]
      : [];
  });
  const same = new Set();
  if (!pairs.length) return same;
  const browser = await open('about:blank');
  try {
    for (const [id, left, right] of pairs) {
      const near = await browser.evaluate(`async () => {
        const load = (data) => new Promise((done) => { const image = new Image(); image.onload = () => done(image); image.src = 'data:image/png;base64,' + data; });
        const left = ${JSON.stringify(left)};
        const right = ${JSON.stringify(right)};
        let differing = 0;
        let total = 0;
        for (let index = 0; index < left.length; index++) {
          const [a, b] = [await load(left[index]), await load(right[index])];
          if (a.width !== b.width || a.height !== b.height) return false;
          const context = new OffscreenCanvas(a.width, a.height).getContext('2d');
          context.drawImage(a, 0, 0);
          const pixelsA = context.getImageData(0, 0, a.width, a.height).data;
          context.clearRect(0, 0, a.width, a.height);
          context.drawImage(b, 0, 0);
          const pixelsB = context.getImageData(0, 0, b.width, b.height).data;
          for (let p = 0; p < pixelsA.length; p += 4) {
            const delta = Math.max(Math.abs(pixelsA[p] - pixelsB[p]), Math.abs(pixelsA[p + 1] - pixelsB[p + 1]), Math.abs(pixelsA[p + 2] - pixelsB[p + 2]));
            if (delta > ${ANTIALIAS_CHANNEL_DELTA}) return false;
            if (delta > 0) differing++;
          }
          total += a.width * a.height;
        }
        return differing <= total * ${ANTIALIAS_PIXEL_SHARE};
      }`);
      if (near) same.add(id);
    }
  } finally {
    await browser.close();
  }
  return same;
}

const samePixels = (a, b) =>
  a.chunks.length === b.chunks.length &&
  a.chunks.every((chunk, index) => chunk === b.chunks[index]);

// Antialiasing depends on a block's absolute position in the document: a block pushed down 40 px
// by a change above it repaints the edges of its circles and rounded corners a level or two apart.
// So a differing block whose top moved is captured again on the side where it sits higher, pushed
// down to the other side's top, and stays a difference only if it still differs there.
async function realignMoved(sides) {
  const targets = sides.map(() => new Map());
  const [before, after] = sides.map(({ blocks }) => blocks);
  for (const [id, a] of before) {
    const b = after.get(id);
    if (!b || a.unstable || b.unstable || samePixels(a, b)) continue;
    if (a.top === null || b.top === null || Math.abs(a.top - b.top) < 0.01)
      continue;
    if (a.top < b.top) targets[0].set(id, b.top);
    else targets[1].set(id, a.top);
  }
  let count = 0;
  for (const [side, { dir, blocks }] of sides.entries()) {
    if (!targets[side].size) continue;
    const pages = [
      ...new Set([...targets[side].keys()].map((id) => blocks.get(id).page)),
    ];
    const again = await renderSite(dir, pages, targets[side]);
    for (const id of targets[side].keys())
      if (again.has(id)) {
        blocks.set(id, again.get(id));
        count++;
      }
  }
  return count;
}

function compareBlocks(before, after, antialiased) {
  const differing = [];
  for (const id of new Set([...before.keys(), ...after.keys()])) {
    const [a, b] = [before.get(id), after.get(id)];
    const change = !a
      ? 'added'
      : !b
        ? 'removed'
        : a.unstable || b.unstable
          ? 'unstable'
          : samePixels(a, b) || antialiased.has(id)
            ? null
            : 'changed';
    if (change)
      differing.push({
        id,
        change,
        page: (b ?? a).page,
        names: [...new Set([...(a?.names ?? []), ...(b?.names ?? [])])],
        reads: (a ?? b).reads,
      });
  }
  return differing;
}

// `ds-select` -> `SelectComponent`, read from the generated API table of the working tree.
function componentClasses() {
  const file = join(ROOT, 'ds-docs/src/app/shared/component-api.generated.ts');
  const classes = new Map();
  if (!existsSync(file)) return classes;
  for (const [, selector, className] of readFileSync(file, 'utf8').matchAll(
    /"selector": "(ds-[a-z0-9-]+)",\s*"isElement": true,\s*"className": "(\w+)"/g,
  ))
    classes.set(selector, className);
  return classes;
}

function changelogBlock(version) {
  if (!existsSync(CHANGELOG)) return '';
  const heading = version === 'unreleased' ? 'Unreleased' : version;
  const lines = readFileSync(CHANGELOG, 'utf8')
    .replace(/\r\n/g, '\n')
    .split('\n');
  const start = lines.findIndex((line) =>
    new RegExp(`^## ${heading.replace(/\./g, '\\.')}\\b`).test(line),
  );
  if (start === -1) return '';
  const end = lines.findIndex(
    (line, index) => index > start && /^## /.test(line),
  );
  return lines.slice(start + 1, end === -1 ? undefined : end).join('\n');
}

function verdict(differing, blocks, manifestText, changelogText, classes) {
  const text = `${manifestText}\n${changelogText}`;
  const isNamed = (name) =>
    new RegExp(
      String.raw`(?<![\w-])` +
        name.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`) +
        String.raw`(?![\w-])`,
    ).test(text);
  let manifest = {};
  try {
    manifest = manifestText ? JSON.parse(manifestText) : {};
  } catch {}
  const withdrawn = (manifest.items ?? []).filter((item) =>
    ['removed-api', 'token-rename'].includes(item.kind),
  );
  const withdrawnReads = (reads) => {
    const read = new Set(reads);
    return [
      ...new Set(
        withdrawn.flatMap((item) =>
          candidatesOf(item.old, item.new, item.kind, read, new Set()).map(
            ({ name }) => name,
          ),
        ),
      ),
    ].filter((name) => read.has(name));
  };
  const results = differing.map((block) => {
    const candidates = [
      ...block.names,
      ...block.names.map((name) => classes.get(name)).filter(Boolean),
    ];
    return {
      ...block,
      namedBy: [...candidates.filter(isNamed), ...withdrawnReads(block.reads)],
    };
  });
  const differingIds = new Set(differing.map((block) => block.id));
  const evidence = [];
  const entries = [
    ...(manifest.items ?? []).map((item) => [
      item.id ?? '<no id>',
      item.evidence,
    ]),
    ...(manifest.informational ?? []).map((entry, index) => [
      `informational[${index}]`,
      entry?.evidence,
    ]),
  ];
  for (const [label, list] of entries)
    for (const entry of Array.isArray(list) ? list : []) {
      const match = /^pixels:(.+)$/.exec(String(entry).trim());
      if (!match) continue;
      const id = match[1].trim();
      const problem = !blocks.has(id)
        ? 'names no docs block'
        : differingIds.has(id)
          ? 'differs between the two builds'
          : null;
      evidence.push({ label, id, problem });
    }
  return { results, evidence };
}

// Library components whose folder changed between `fromRef` and `to` (the working tree when null),
// or the reason the change cannot be mapped to docs blocks.
function affectedComponents(fromRef, to) {
  const changed = new Set(
    git(['diff', '--name-only', fromRef, ...(to ? [to] : []), '--', 'src'])
      .split('\n')
      .filter(Boolean),
  );
  if (!to) {
    for (const file of git([
      'ls-files',
      '-o',
      '--exclude-standard',
      '--',
      'src',
    ]).split('\n')) {
      if (file) {
        changed.add(file);
      }
    }
  }
  const components = new Set();
  for (const file of changed) {
    const match = /^src\/lib\/components\/([^/]+)\//.exec(file);
    if (!match) {
      return { reason: `${file} is outside src/lib/components/<name>/` };
    }
    components.add(match[1]);
  }
  return { components: [...components].sort() };
}

function reportSkipped(skippedBefore, skippedAfter, affectedNote) {
  const byPage = new Map();
  for (const { id, page } of [...skippedBefore, ...skippedAfter]) {
    byPage.set(page, new Set([...(byPage.get(page) ?? []), id]));
  }
  const total = new Set([...byPage.values()].flatMap((ids) => [...ids])).size;
  console.log(
    `  ${affectedNote}; ${total} block(s) skipped, they render no ds-<component> element of a changed component:`,
  );
  for (const [page, ids] of byPage) {
    console.log(`    ${page}: ${[...ids].join(', ')}`);
  }
}

async function main() {
  const started = Date.now();
  const from = option('--from');
  const to = option('--to');
  const dists = option('--dists', 2);
  const pagesOption = option('--pages');
  const crops = option('--crops');
  const affected = argv.includes('--affected');
  const history = Boolean(to);
  const tags = releaseTags(ROOT);
  const fromRef =
    from ?? (to ? previousBoundary(tags, to.replace(/^v/, '')) : tags.at(-1));
  if (!dists && !fromRef) fail('no release tag to compare against');
  const version = to ? to.replace(/^v/, '') : 'unreleased';

  let before;
  let after;
  let pages;
  let mode = 'docs of the base, library of each side';
  if (dists) {
    [before, after] = dists.map((dir) => ({ dir: resolve(dir) }));
    pages = pagesOption ? pagesOption.split(',') : ['/'];
  } else {
    console.log(`check-render-evidence: ${fromRef}..${to ?? 'working tree'}`);
    const fromTree = treeOf(fromRef);
    const toTree = treeOf(to);
    pages = pagesOption ? pagesOption.split(',') : pagesOf(fromTree);
    before = buildDocs(fromTree, fromTree, fromRef, true);
    after = buildDocs(
      fromTree,
      toTree,
      `${fromRef} docs, ${to ?? 'working tree'} library`,
      Boolean(to),
    );
    if (!after) {
      mode =
        'docs and library of each side (the base docs do not compile against the new library)';
      after = buildDocs(toTree, toTree, to ?? 'working tree', Boolean(to));
      pages = [...new Set([...pages, ...(pagesOption ? [] : pagesOf(toTree))])];
    }
    if (!before || !after) fail('a docs build failed');
    // A working-tree build is superseded by the next edit; tag builds are the ones worth keeping.
    if (!to) {
      mkdirSync(CACHE, { recursive: true });
      const keep = new Set([before.key, after.key]);
      writeFileSync(join(CACHE, after.key, '.working-tree'), '');
      for (const entry of readdirSync(CACHE))
        if (!keep.has(entry) && existsSync(join(CACHE, entry, '.working-tree')))
          rmSync(join(CACHE, entry), { recursive: true, force: true });
    }
  }
  const builtAt = Date.now();

  let only = null;
  let affectedNote = '';
  if (affected) {
    const plan = dists ? null : affectedComponents(fromRef, to);
    if (plan?.components?.length) {
      const prefixes = plan.components.map((name) => `ds-${name}`);
      only = ({ names }) =>
        names.some((name) =>
          prefixes.some(
            (prefix) => name === prefix || name.startsWith(`${prefix}-`),
          ),
        );
      affectedNote = `affected: ${plan.components.join(', ')}`;
    } else {
      console.log(
        `  --affected: ${plan?.reason ?? 'needs refs, not --dists'}; running the full comparison`,
      );
    }
  }
  const [blocksBefore, blocksAfter] = await Promise.all([
    renderSite(before.dir, pages, null, only),
    renderSite(after.dir, pages, null, only),
  ]);
  const realigned = await realignMoved([
    { dir: before.dir, blocks: blocksBefore },
    { dir: after.dir, blocks: blocksAfter },
  ]);
  const antialiased = await antialiasOnly(blocksBefore, blocksAfter);
  const differing = compareBlocks(blocksBefore, blocksAfter, antialiased);
  const manifestPath = join(MIGRATIONS, `${version}.json`);
  const manifestText = existsSync(manifestPath)
    ? readFileSync(manifestPath, 'utf8')
    : '';
  const { results, evidence } = verdict(
    differing,
    new Map([
      ...blocksBefore.skipped.map(({ id }) => [id, null]),
      ...blocksAfter.skipped.map(({ id }) => [id, null]),
      ...blocksBefore,
      ...blocksAfter,
    ]),
    manifestText,
    changelogBlock(version),
    componentClasses(),
  );

  if (crops) {
    mkdirSync(crops, { recursive: true });
    for (const block of differing)
      for (const [side, blocks] of [
        ['before', blocksBefore],
        ['after', blocksAfter],
      ])
        blocks
          .get(block.id)
          ?.chunks.forEach((data, index) =>
            writeFileSync(
              join(
                crops,
                `${block.id.replace(/[^\w~-]+/g, '_')}.${side}.${index + 1}.png`,
              ),
              Buffer.from(data, 'base64'),
            ),
          );
  }

  console.log(
    `  ${pages.length} page(s), ${blocksBefore.size} / ${blocksAfter.size} block(s), ${differing.length} differ (${mode})`,
  );
  if (antialiased.size)
    console.log(
      `  ${antialiased.size} block(s) differ by antialiasing only (no channel more than ${ANTIALIAS_CHANNEL_DELTA}/255 apart, on at most ${ANTIALIAS_PIXEL_SHARE * 100}% of pixels)`,
    );
  if (realigned)
    console.log(
      `  ${realigned} moved block(s) captured again at the other side's position`,
    );
  if (only) {
    reportSkipped(blocksBefore.skipped, blocksAfter.skipped, affectedNote);
  }
  for (const block of results)
    console.log(
      `  ${block.namedBy.length ? 'named  ' : 'UNNAMED'}  ${block.change.padEnd(8)}  ${block.id}  ${
        block.namedBy.length
          ? `by ${block.namedBy.join(', ')}`
          : `none of: ${block.names.join(', ') || '(the block names no ds-* element, class or token)'}`
      }`,
    );
  for (const entry of evidence)
    console.log(
      `  ${entry.problem ? 'BAD    ' : 'ok     '}  pixels:${entry.id}  (${entry.label})${entry.problem ? `  ${entry.problem}` : ''}`,
    );
  const unnamed = results.filter((block) => !block.namedBy.length);
  const badEvidence = evidence.filter((entry) => entry.problem);
  console.log(
    `  built in ${Math.round((builtAt - started) / 1000)} s, rendered and compared in ${Math.round((Date.now() - builtAt) / 1000)} s`,
  );
  if (!history && (unnamed.length || badEvidence.length)) {
    console.error(
      `\ncheck-render-evidence: ${unnamed.length} differing block(s) name nothing in ` +
        `migrations/${version}.json or the CHANGELOG block, ${badEvidence.length} pixels: evidence entr(ies) ` +
        'do not hold. Name the component whose rendering moved, or drop the evidence that says it did not.',
    );
    process.exitCode = 1;
  }
}

await main();
