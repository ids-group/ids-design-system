// Measures every ds-table on the docs app's dev-only /harness/table-clip page, in light and dark, with
// container resizes and column drags, and screenshots each table.
//
//   node tools/table-clip-harness.mjs run <docsUrl> <outDir>      measure + screenshots
//   node tools/table-clip-harness.mjs diff <baseDir> <afterDir>   print every number that moved
//   node tools/table-clip-harness.mjs check <outDir> [baseDir]    exit 1 when an invariant fails
//   node tools/table-clip-harness.mjs layout <baselineUrl> <docsUrl>
//                                                                exit 1 when a `layout="auto"` column
//                                                                is not as wide as on the baseline
//
// Serve the docs app first (`ng serve ds-docs --port <port>`); the route exists in dev mode only.
// With CDP_BROWSER_URL set, `run` drives a tab of that running Chrome instead of launching one.
// `check` pins the truncate contract: a `truncate` column without `width` clips at its own column
// width, causes no horizontal overflow where its header fits, clips at 240px of text in a table
// that scrolls anyway, keeps every column width when the case turns to page 2 (a `Page 2` button
// swapping `data`, or the pager's next button), and every case with no such column renders exactly
// as in `baseDir`.
// `layout` reads the `layout-*` cases: `<baselineUrl>` serves the page from a 0.15.0 checkout with
// `ds-docs/src/app/harness/table-layout.cases.ts` and its plain `@for` block copied in, `<docsUrl>`
// this checkout, where each case renders under the page's `'fixed'` config and again as `<id>-auto`.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { open, wait } from './headless-chrome.mjs';

const [mode, first, second] = process.argv.slice(2);
const TOLERANCE = 1;

const measureCase = `(id) => {
  const section = document.querySelector('[data-case="' + id + '"]');
  const wrap = section.querySelector('.scroll-wrap');
  const headRow = section.querySelector('thead tr');
  const textBox = (node) => { const range = document.createRange(); range.selectNodeContents(node); return range.getBoundingClientRect(); };
  const shaves = (element) => {
    if (getComputedStyle(element).overflowY === 'visible' || !element.textContent.trim()) return false;
    const box = element.getBoundingClientRect();
    const text = textBox(element);
    return text.top < box.top - 0.5 || text.bottom > box.bottom + 0.5;
  };
  const DS_CLIP = '.cell-clip, .cell-clip-text, .th-label, .th-text';
  const bodyRows = [...section.querySelectorAll('tbody tr')].filter((row) => !row.classList.contains('spacer') && row.cells.length > 1);
  const columns = [...headRow.querySelectorAll('th[data-col-key]')].map((th) => {
    const cells = bodyRows.map((row) => row.cells[th.cellIndex]).filter(Boolean);
    const clip = (td) => td.querySelector('.cell-clip-text') ?? td.querySelector('.cell-clip');
    const truncate = cells.some((td) => td.querySelector('.cell-clip'));
    const style = getComputedStyle(th);
    const content = th.getBoundingClientRect().width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    return {
      key: th.dataset.colKey,
      width: Math.round(th.getBoundingClientRect().width),
      headerFloor: Math.round((th.querySelector('.th-label')?.scrollWidth ?? 0) + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)),
      // Widths sit on the <col>; in a dsTableResize case an explicit one is read as dragged.
      dragged: (() => { const col = th.closest('table').querySelector('colgroup')?.children[th.cellIndex]; const width = col?.style.width || th.style.width; return width && th.closest('[dstableresize]') ? Math.round(parseFloat(width)) : null; })(),
      content: Math.round(content),
      truncate,
      clipped: cells.map((td, index) => {
        const element = clip(td);
        return element && element.scrollWidth > element.clientWidth ? index : -1;
      }).filter((index) => index >= 0),
      visible: cells.map((td) => { const element = clip(td); return element ? element.clientWidth : null; }),
      textMax: Math.round(Math.max(0, ...cells.map((td) => {
        const walker = document.createTreeWalker(td, NodeFilter.SHOW_TEXT);
        let widest = 0;
        while (walker.nextNode()) if (walker.currentNode.textContent.trim()) widest = Math.max(widest, textBox(walker.currentNode).width);
        return widest;
      }))),
      shaved: cells.filter((td) => [...td.querySelectorAll(DS_CLIP)].some(shaves)).length + ([...th.querySelectorAll(DS_CLIP)].some(shaves) ? 1 : 0),
      shavedConsumer: cells.filter((td) => [...td.querySelectorAll('*')].some((element) => !element.matches(DS_CLIP) && shaves(element))).length,
      spill: cells.map((td, index) => (!truncate && td.scrollWidth > td.clientWidth + 1 ? index : -1)).filter((index) => index >= 0),
    };
  });
  return {
    id,
    sectionWidth: Math.round(section.getBoundingClientRect().width),
    tableWidth: Math.round(section.querySelector('table').getBoundingClientRect().width),
    overflow: wrap ? wrap.scrollWidth - wrap.clientWidth : null,
    headHeight: Math.round(headRow.getBoundingClientRect().height),
    rowHeights: bodyRows.slice(0, 12).map((row) => Math.round(row.getBoundingClientRect().height)),
    columns,
  };
}`;

async function run(url, outDir) {
  const { s, evaluate, close } = await open(url);
  const result = {
    url,
    cases: {},
    pages: {},
    container: {},
    drags: {},
    dark: {},
  };
  try {
    // A metrics override in a tab of a running browser stalls its frames, and so every screenshot.
    const attached = Boolean(process.env.CDP_BROWSER_URL);
    if (!attached)
      await s('Emulation.setDeviceMetricsOverride', {
        width: 1900,
        height: 1300,
        deviceScaleFactor: 1,
        mobile: false,
      });
    for (let attempt = 0; attempt < 120; attempt++) {
      const ready = await evaluate(
        `() => document.querySelectorAll('[data-case] ds-table tbody tr').length > 0 && document.fonts.status === 'loaded'`,
      ).catch(() => false);
      if (ready) break;
      await wait(500);
    }
    await wait(1500);
    const ids = await evaluate(
      `() => [...document.querySelectorAll('[data-case]')].map((section) => section.dataset.case)`,
    );
    if (ids.length === 0)
      throw new Error(
        `no [data-case] sections at ${url} after 60s: the harness route exists only in a development build (ng serve)`,
      );

    const shoot = async (id, file) => {
      const rect = await evaluate(
        `() => { const section = document.querySelector('[data-case="${id}"]'); section.scrollIntoView({ block: 'start' }); const box = section.getBoundingClientRect(); const page = ${attached}; return { x: box.x + (page ? scrollX : 0), y: box.y + (page ? scrollY : 0), width: box.width, height: Math.min(box.height, 1250) }; }`,
      );
      await wait(150);
      // A browser zoomed to other than 100% takes the clip in device pixels, not CSS pixels.
      const { zoom = 1 } = (await s('Page.getLayoutMetrics')).cssVisualViewport;
      const params = {
        format: 'png',
        captureBeyondViewport: attached,
        clip: {
          x: rect.x * zoom,
          y: rect.y * zoom,
          width: rect.width * zoom,
          height: rect.height * zoom,
          scale: 1 / zoom,
        },
      };
      // A background tab composites rarely, so a capture can wait for a frame that does not come;
      // asking again gets one.
      let data = null;
      for (let attempt = 0; attempt < 6 && data === null; attempt++)
        data = await Promise.race([
          s('Page.captureScreenshot', params).then((shot) => shot.data),
          wait(20000).then(() => null),
        ]);
      if (data === null) {
        console.error(`table-clip-harness: no screenshot for ${file}`);
        return;
      }
      writeFileSync(file, Buffer.from(data, 'base64'));
    };

    const setTheme = (theme) =>
      evaluate(
        `() => { document.documentElement.dataset.theme = '${theme}'; }`,
      );
    for (const theme of ['light', 'dark']) {
      await setTheme(theme);
      await wait(400);
      const dir = join(outDir, theme);
      mkdirSync(dir, { recursive: true });
      for (const id of ids) {
        const measured = await evaluate(`() => (${measureCase})('${id}')`);
        if (theme === 'light') result.cases[id] = measured;
        else result.dark[id] = measured;
        await shoot(id, join(dir, `${id}.png`));
      }
    }
    await setTheme('light');
    await wait(300);

    mkdirSync(join(outDir, 'pages'), { recursive: true });
    const pagedIds = await evaluate(
      `() => [...document.querySelectorAll('[data-case]')].filter((section) => section.querySelector('[data-show-page-two], ds-pagination')).map((section) => section.dataset.case)`,
    );
    for (const id of pagedIds) {
      await evaluate(
        `() => { const section = document.querySelector('[data-case="${id}"]'); const swap = section.querySelector('[data-show-page-two]'); (swap ?? [...section.querySelectorAll('ds-pagination button.pagination-button')].at(-1)).click(); }`,
      );
      await wait(600);
      result.pages[id] = await evaluate(`() => (${measureCase})('${id}')`);
      await shoot(id, join(outDir, 'pages', `${id}-2.png`));
    }

    mkdirSync(join(outDir, 'container'), { recursive: true });
    for (const width of [1200, 800, 480, 320]) {
      await evaluate(
        `() => { document.querySelector('[data-case="container-resize"]').style.width = '${width}px'; }`,
      );
      await wait(400);
      result.container[width] = await evaluate(
        `() => (${measureCase})('container-resize')`,
      );
      await shoot(
        'container-resize',
        join(outDir, 'container', `container-${width}.png`),
      );
    }
    await evaluate(
      `() => { document.querySelector('[data-case="container-resize"]').style.width = '1200px'; }`,
    );

    const handle = (id, key) =>
      evaluate(
        `() => { const section = document.querySelector('[data-case="${id}"]'); section.scrollIntoView({ block: 'center' }); const th = section.querySelector('th[data-col-key="${key}"]'); th.scrollIntoView({ block: 'nearest', inline: 'center' }); const box = th.querySelector('.col-resize').getBoundingClientRect(); return { x: box.x + box.width / 2, y: box.y + box.height / 2 }; }`,
      );
    const mouse = (type, x, y) =>
      s('Input.dispatchMouseEvent', {
        type,
        x,
        y,
        button: 'left',
        buttons: type === 'mouseReleased' ? 0 : 1,
        clickCount: 1,
        pointerType: 'mouse',
      });
    const drag = async (id, key, delta) => {
      const start = await handle(id, key);
      await wait(100);
      await mouse('mouseMoved', start.x, start.y);
      await mouse('mousePressed', start.x, start.y);
      for (let step = 1; step <= 10; step++)
        await mouse('mouseMoved', start.x + (delta * step) / 10, start.y);
      await mouse('mouseReleased', start.x + delta, start.y);
      await wait(300);
    };
    const home = async (id, key) => {
      await evaluate(
        `() => document.querySelector('[data-case="${id}"] th[data-col-key="${key}"] .col-resize').focus()`,
      );
      await s('Input.dispatchKeyEvent', {
        type: 'keyDown',
        key: 'Home',
        code: 'Home',
        windowsVirtualKeyCode: 36,
      });
      await s('Input.dispatchKeyEvent', {
        type: 'keyUp',
        key: 'Home',
        code: 'Home',
        windowsVirtualKeyCode: 36,
      });
      await wait(300);
    };
    result.tooltips = {};
    for (const [id, key, row] of [
      ['trunc-tight', 'email', 0],
      ['ecm-microsites-cta', 'name', 3],
      ['templates-hints', 'email', 0],
      ['trunc-room', 'email', 1],
      ['delta-review-removed-shipped-663', 'email', 0],
      ['delta-review-removed-truncate-663', 'email', 0],
      ['delta-review-unchanged-truncate', 'email', 0],
    ]) {
      const point = await evaluate(
        `() => { const th = document.querySelector('[data-case="${id}"] th[data-col-key="${key}"]'); const cell = th.closest('table').tBodies[0].rows[${row}].cells[th.cellIndex]; cell.scrollIntoView({ block: 'center', inline: 'center' }); const box = cell.getBoundingClientRect(); return { x: box.x + box.width / 2, y: box.y + box.height / 2 }; }`,
      );
      await s('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: point.x,
        y: point.y,
      });
      await wait(700);
      result.tooltips[`${id} ${key} ${row}`] = await evaluate(
        `() => document.querySelector('[role="tooltip"]')?.textContent.trim() ?? null`,
      );
      await s('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 });
      await wait(300);
    }
    mkdirSync(join(outDir, 'drags'), { recursive: true });
    const steps = {
      resize: [
        ['email', 150],
        ['notes', 120],
        ['name', -60],
        ['email', -260],
        ['email', 'home'],
      ],
      'broker-ai-stats': [
        ['email', 120],
        ['email', -200],
        ['name', 80],
      ],
      'resize-content': [
        ['name', 80],
        ['notes', -120],
        ['email', -80],
        ['amount', 60],
        ['name', 'home'],
      ],
    };
    for (const [id, list] of Object.entries(steps)) {
      result.drags[id] = [];
      for (const [index, [key, delta]] of list.entries()) {
        if (delta === 'home') await home(id, key);
        else await drag(id, key, delta);
        result.drags[id].push({
          step: `${key} ${delta}`,
          ...(await evaluate(`() => (${measureCase})('${id}')`)),
        });
        await shoot(id, join(outDir, 'drags', `${id}-${index + 1}.png`));
      }
    }
  } finally {
    await close();
  }
  writeFileSync(join(outDir, 'metrics.json'), JSON.stringify(result, null, 2));
  console.log(
    `table-clip-harness: ${Object.keys(result.cases).length} cases measured into ${outDir}`,
  );
}

const load = (dir) =>
  JSON.parse(readFileSync(join(dir, 'metrics.json'), 'utf8'));

function* differences(base, after, label) {
  const keys = (list) => new Map(list.map((column) => [column.key, column]));
  if (Math.abs(base.overflow - after.overflow) > TOLERANCE)
    yield `${label}: overflow ${base.overflow} -> ${after.overflow}`;
  if (Math.abs(base.tableWidth - after.tableWidth) > TOLERANCE)
    yield `${label}: table ${base.tableWidth} -> ${after.tableWidth}`;
  if (Math.abs(base.headHeight - after.headHeight) > TOLERANCE)
    yield `${label}: head height ${base.headHeight} -> ${after.headHeight}`;
  if (base.rowHeights.join() !== after.rowHeights.join())
    yield `${label}: row heights ${base.rowHeights.join('/')} -> ${after.rowHeights.join('/')}`;
  const afterColumns = keys(after.columns);
  for (const column of base.columns) {
    const next = afterColumns.get(column.key);
    if (Math.abs(column.width - next.width) > TOLERANCE)
      yield `${label}: ${column.key}${column.truncate ? ' (truncate)' : ''} width ${column.width} -> ${next.width}`;
    if (column.clipped.join() !== next.clipped.join())
      yield `${label}: ${column.key} clipped rows [${column.clipped}] -> [${next.clipped}]`;
    if (column.spill.join() !== next.spill.join())
      yield `${label}: ${column.key} spilling rows [${column.spill}] -> [${next.spill}]`;
  }
}

function diff(baseDir, afterDir) {
  const base = load(baseDir);
  const after = load(afterDir);
  const lines = [];
  for (const id of Object.keys(base.cases))
    lines.push(...differences(base.cases[id], after.cases[id], id));
  for (const id of Object.keys(base.dark))
    lines.push(...differences(base.dark[id], after.dark[id], `dark ${id}`));
  for (const id of Object.keys(base.pages ?? {}))
    if (after.pages?.[id])
      lines.push(
        ...differences(base.pages[id], after.pages[id], `page 2 ${id}`),
      );
  for (const width of Object.keys(base.container))
    lines.push(
      ...differences(
        base.container[width],
        after.container[width],
        `container ${width}`,
      ),
    );
  for (const id of Object.keys(base.drags))
    base.drags[id].forEach((step, index) =>
      lines.push(
        ...differences(
          step,
          after.drags[id][index],
          `drag ${id} #${index + 1} (${step.step})`,
        ),
      ),
    );
  console.log(
    lines.length ? lines.join('\n') : 'table-clip-harness: no differences',
  );
}

function check(outDir, baseDir) {
  const result = load(outDir);
  const failures = [];
  const fail = (message) => failures.push(message);
  const columnsOf = (id) => result.cases[id].columns;
  const declared = {
    'fixed-widths': { name: 180, status: 90 },
    'select-sort-actions': { status: 100 },
    'ecm-audit-history': { when: 180, version: 90 },
    'ecm-microsite-errors': { when: 170, code: 80 },
    'ecm-microsites-cta': { city: 170, name: 200 },
    'broker-ai-stats': { email: 240 },
    resize: { notes: 240 },
    'sticky-many': { name: 160, city: 140, status: 120, amount: 140 },
    'numeric-truncate-narrow': { email: 160 },
    'delta-review-removed-truncate': { step: 200 },
    'expand-truncate': { amount: 120 },
    'resize-content': { amount: 120 },
  };
  for (const [id, widths] of Object.entries(declared)) {
    for (const [key, width] of Object.entries(widths)) {
      const column = columnsOf(id).find((candidate) => candidate.key === key);
      if (Math.abs(column.width - width) > TOLERANCE)
        fail(`${id}: ${key} is ${column.width}px, declared ${width}`);
    }
  }
  const autoTruncate = new Set([
    'trunc-room',
    'trunc-tight',
    'trunc-tighter',
    'select-sort-actions',
    'sticky-many',
    'long-words',
    'many-narrow',
    'few-wide',
    'ecm-audit-history',
    'ecm-microsite-errors',
    'ecm-seg-members',
    'ecm-seg-records',
    'templates-hints',
    'container-resize',
    'ecm-delta-truncate',
    'virtual',
    'resize',
    'delta-review-unchanged-truncate',
    'delta-review-removed-truncate',
    'delta-review-removed-truncate-919',
    'delta-review-removed-truncate-663',
    'delta-review-unchanged-both-auto',
    'expand-truncate',
    'resize-content',
  ]);
  // min-width-token is wider than its container by declaration; three clip inside a numeric width
  // that used to get the cell padding on top; the rest hold a text column, whose share comes from
  // the column config.
  const widthChanging = new Set([
    ...autoTruncate,
    'min-width-token',
    'ecm-microsites-cta',
    'broker-ai-stats',
    'numeric-truncate-narrow',
    'paging-page-1',
    'paging-page-2',
    'paging-pager',
    'paging-all',
    'paging-server',
    'truncate-link',
    'min-width-column',
    'min-width-column-off',
    'auto-mixed',
    'content-wide',
    'ecm-delta-workaround',
    'equal-stretch',
    'fixed-widths',
    'header-longer',
    'trunc-content',
  ]);
  const fixedTruncate = {
    'ecm-microsites-cta': ['name'],
    'broker-ai-stats': ['email'],
    resize: ['notes'],
  };
  const fair = (label, measured) => {
    for (const column of measured.columns.filter(
      (candidate) => candidate.truncate,
    )) {
      for (const row of column.clipped) {
        if (column.content - column.visible[row] > 2)
          fail(
            `${label}: ${column.key} row ${row} clips at ${column.visible[row]}px inside a ${column.content}px column`,
          );
      }
    }
  };
  for (const id of widthChanging) fair(id, result.cases[id]);
  for (const [width, measured] of Object.entries(result.container))
    fair(`container ${width}`, measured);
  for (const [id, keys] of Object.entries(fixedTruncate))
    fair(id, {
      columns: columnsOf(id).filter((column) => keys.includes(column.key)),
    });
  for (const id of [
    'few-wide',
    'delta-review-unchanged-truncate',
    'delta-review-removed-truncate',
  ]) {
    for (const column of columnsOf(id))
      if (column.clipped.length)
        fail(
          `${id}: ${column.key} clips rows [${column.clipped}] although the table has room`,
        );
  }
  // 240px of text plus the default cell padding.
  const scrollingClip = 272;
  const overflowOnlyFromHeaders = (label, measured) => {
    if (measured.overflow <= 0) return;
    for (const column of measured.columns.filter(
      (candidate) => candidate.truncate && candidate.dragged === null,
    )) {
      const limit = Math.max(column.headerFloor, scrollingClip);
      if (column.width > limit + 2 && column.clipped.length)
        fail(
          `${label}: overflow ${measured.overflow}px while truncate column ${column.key} is ${column.width}px, above ${limit}px`,
        );
    }
  };
  for (const id of autoTruncate) overflowOnlyFromHeaders(id, result.cases[id]);
  for (const [width, measured] of Object.entries(result.container))
    overflowOnlyFromHeaders(`container ${width}`, measured);
  for (const id of [
    'trunc-tight',
    'trunc-tighter',
    'ecm-audit-history',
    'ecm-microsite-errors',
    'ecm-delta-truncate',
    'trunc-room',
    'few-wide',
    'delta-review-unchanged-truncate',
    'delta-review-removed-truncate',
    'delta-review-removed-truncate-919',
  ]) {
    if (result.cases[id].overflow > 0)
      fail(`${id}: horizontal overflow ${result.cases[id].overflow}px`);
  }
  for (const id of ['max-content-fixed', 'max-content-virtual']) {
    if (!result.cases[id]) fail(`${id}: case missing`);
    else if (result.cases[id].tableWidth > 2000)
      fail(
        `${id}: a max-content container widened the table to ${result.cases[id].tableWidth}px`,
      );
  }
  for (const [width, measured] of Object.entries(result.container)) {
    if (Number(width) >= 800 && measured.overflow > 0)
      fail(`container ${width}: horizontal overflow ${measured.overflow}px`);
  }
  for (const [id, steps] of Object.entries(result.drags)) {
    const initial = result.cases[id].columns;
    steps.forEach((step, index) => {
      const [key, delta] = step.step.split(' ');
      const previous = index === 0 ? initial : steps[index - 1].columns;
      const before = previous.find((column) => column.key === key).width;
      const now = step.columns.find((column) => column.key === key).width;
      const column = step.columns.find((candidate) => candidate.key === key);
      if (delta === 'home') {
        // Home drops the override; the width that follows depends on the columns still dragged.
        const lastDrag = steps
          .slice(0, index)
          .findLast((earlier) => earlier.step.startsWith(`${key} `));
        const draggedTo = lastDrag?.columns.find(
          (candidate) => candidate.key === key,
        ).width;
        if (draggedTo !== undefined && Math.abs(now - draggedTo) <= 1)
          fail(`${id} #${index + 1}: Home kept ${key} at ${now}px`);
      } else {
        const expected = Math.max(48, before + Number(delta));
        if (Math.abs(column.dragged - expected) > 2)
          fail(
            `${id} #${index + 1}: dragging ${key} by ${delta} from ${before} set ${column.dragged}, expected ${expected}`,
          );
        if (now < column.dragged - 2)
          fail(
            `${id} #${index + 1}: ${key} renders ${now}px, narrower than the dragged ${column.dragged}`,
          );
        if (column.truncate && now > column.dragged + 2 && step.overflow > 0)
          fail(
            `${id} #${index + 1}: ${key} renders ${now}px, wider than the dragged ${column.dragged} while the table scrolls`,
          );
      }
      fair(`${id} #${index + 1}`, step);
    });
  }
  for (const [id, pageTwo] of Object.entries(result.pages ?? {})) {
    const pageOne = result.cases[id];
    if (pageOne.tableWidth !== pageTwo.tableWidth)
      fail(
        `${id}: table ${pageOne.tableWidth} -> ${pageTwo.tableWidth}px on page 2`,
      );
    for (const column of pageOne.columns) {
      const next = pageTwo.columns.find(
        (candidate) => candidate.key === column.key,
      );
      if (column.width !== next?.width)
        fail(
          `${id}: ${column.key} ${column.width} -> ${next?.width}px on page 2`,
        );
    }
  }
  const tips = result.tooltips ?? {};
  const expectTip = (label, wanted) => {
    if (wanted === null ? tips[label] : !tips[label]?.includes(wanted))
      fail(`tooltip ${label}: got ${JSON.stringify(tips[label])}`);
  };
  expectTip('trunc-tight email 0', 'alexandra.montgomery-fitzgerald@');
  expectTip('ecm-microsites-cta name 3', 'Bartholomew Featherstonehaugh');
  expectTip('templates-hints email 0', 'alexandra.montgomery-fitzgerald@');
  expectTip('trunc-room email 1', null);
  expectTip('delta-review-removed-truncate-663 email 0', 'margaret.whitfield@');
  expectTip('delta-review-unchanged-truncate email 0', null);
  const glyphs = (label, measured) => {
    for (const column of measured.columns)
      if (column.shaved)
        fail(
          `${label}: ${column.key} clips the glyphs of ${column.shaved} cell(s) top or bottom`,
        );
  };
  for (const [id, measured] of Object.entries(result.cases))
    glyphs(id, measured);
  for (const [id, measured] of Object.entries(result.dark))
    glyphs(`dark ${id}`, measured);
  for (const [width, measured] of Object.entries(result.container))
    glyphs(`container ${width}`, measured);
  for (const [id, steps] of Object.entries(result.drags))
    steps.forEach((step, index) => glyphs(`${id} #${index + 1}`, step));
  if (baseDir) {
    const base = load(baseDir);
    const taller = (label, before, after) => {
      after.rowHeights.forEach((height, row) => {
        if (height > (before.rowHeights[row] ?? height) + TOLERANCE)
          fail(
            `${label}: row ${row} grew ${before.rowHeights[row]} -> ${height}`,
          );
      });
      for (const column of after.columns) {
        const previous = before.columns.find(
          (candidate) => candidate.key === column.key,
        );
        const added = column.spill.filter(
          (row) => !previous.spill.includes(row),
        );
        if (added.length)
          fail(
            `${label}: ${column.key} content spills its cell in rows [${added}]`,
          );
      }
    };
    for (const id of Object.keys(base.cases))
      taller(id, base.cases[id], result.cases[id]);
    for (const id of Object.keys(base.dark))
      taller(`dark ${id}`, base.dark[id], result.dark[id]);
    for (const width of Object.keys(base.container))
      taller(
        `container ${width}`,
        base.container[width],
        result.container[width],
      );
    for (const id of Object.keys(base.cases).filter(
      (candidate) => !widthChanging.has(candidate),
    )) {
      for (const line of differences(base.cases[id], result.cases[id], id))
        fail(`unchanged case moved - ${line}`);
    }
  }
  if (failures.length) {
    console.error(failures.join('\n'));
    console.error(`\ntable-clip-harness: ${failures.length} failure(s)`);
    process.exit(1);
  }
  console.log('table-clip-harness: every invariant holds');
}

async function measureLayoutCases(url) {
  const { s, evaluate, close } = await open(url);
  try {
    if (!process.env.CDP_BROWSER_URL)
      await s('Emulation.setDeviceMetricsOverride', {
        width: 1900,
        height: 1300,
        deviceScaleFactor: 1,
        mobile: false,
      });
    for (let attempt = 0; attempt < 120; attempt++) {
      const ready = await evaluate(
        `() => document.querySelectorAll('[data-case^="layout-"] ds-table tbody tr').length > 0 && document.fonts.status === 'loaded'`,
      ).catch(() => false);
      if (ready) break;
      await wait(500);
    }
    await wait(1500);
    const ids = await evaluate(
      `() => [...document.querySelectorAll('[data-case^="layout-"]')].map((section) => section.dataset.case)`,
    );
    if (ids.length === 0)
      throw new Error(`no [data-case^="layout-"] sections at ${url}`);
    const measured = {};
    for (const id of ids)
      measured[id] = await evaluate(`() => (${measureCase})('${id}')`);
    return measured;
  } finally {
    await close();
  }
}

async function layout(baselineUrl, url) {
  const baseline = await measureLayoutCases(baselineUrl);
  const current = await measureLayoutCases(url);
  const failures = [];
  for (const [id, base] of Object.entries(baseline)) {
    const auto = current[`${id}-auto`];
    const fixed = current[id];
    if (!auto || !fixed) {
      failures.push(`${id}: missing ${auto ? id : `${id}-auto`} at ${url}`);
      continue;
    }
    console.log(`${id}  (key: 0.15.0 / auto / fixed px)`);
    for (const column of base.columns) {
      const autoWidth = auto.columns.find(
        (candidate) => candidate.key === column.key,
      )?.width;
      const fixedWidth = fixed.columns.find(
        (candidate) => candidate.key === column.key,
      )?.width;
      console.log(
        `  ${column.key}: ${column.width} / ${autoWidth} / ${fixedWidth}`,
      );
      if (
        autoWidth === undefined ||
        Math.abs(autoWidth - column.width) > TOLERANCE
      )
        failures.push(
          `${id}: ${column.key} is ${autoWidth}px under layout="auto", ${column.width}px on the baseline`,
        );
    }
    const config = current[`${id}-config`];
    for (const column of base.columns) {
      const configWidth = config?.columns.find(
        (candidate) => candidate.key === column.key,
      )?.width;
      if (
        configWidth === undefined ||
        Math.abs(configWidth - column.width) > TOLERANCE
      )
        failures.push(
          `${id}: ${column.key} is ${configWidth}px under DS_CONFIG.table.layout 'auto', ${column.width}px on the baseline`,
        );
    }
    if (Math.abs(auto.overflow - base.overflow) > TOLERANCE)
      failures.push(
        `${id}: overflow ${base.overflow} -> ${auto.overflow} under layout="auto"`,
      );
  }
  if (failures.length) {
    console.error(failures.join('\n'));
    console.error(`\ntable-clip-harness layout: ${failures.length} failure(s)`);
    process.exit(1);
  }
  console.log(
    'table-clip-harness layout: every layout="auto" column matches the baseline',
  );
}

if (mode === 'run' && first && second) await run(first, second);
else if (mode === 'layout' && first && second) await layout(first, second);
else if (mode === 'diff' && first && second) diff(first, second);
else if (mode === 'check' && first) check(first, second);
else {
  console.error(
    'usage: node tools/table-clip-harness.mjs run <docsUrl> <outDir> | diff <baseDir> <afterDir> | check <outDir> [baseDir] | layout <baselineUrl> <docsUrl>',
  );
  process.exit(2);
}
