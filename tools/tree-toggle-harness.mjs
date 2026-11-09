// Clicks, double-clicks and keys through the three `toggleOn` modes of ds-tree on the docs app's
// dev-only /harness/tree-toggle page, and checks which of them select a parent and which expand or
// collapse it. Exits 1 on any failed check.
//
//   node tools/tree-toggle-harness.mjs <docsUrl>
//
// Serve the docs app first (`ng serve ds-docs --port <port>`); the route exists in dev mode only.
import { open, wait } from './headless-chrome.mjs';

const [docsUrl] = process.argv.slice(2);
const page = await open(`${docsUrl}/harness/tree-toggle`, {
  chromePath: process.env.CHROME_PATH,
});
const failures = [];
const check = (name, ok, detail) => {
  console.log(
    `${ok ? 'ok  ' : 'FAIL'} ${name}${detail === undefined ? '' : ` ${JSON.stringify(detail)}`}`,
  );
  if (!ok) failures.push(name);
};

const CTRL = 2;
const KEYS = {
  Enter: 13,
  ArrowLeft: 37,
  ArrowRight: 39,
};

const row = (mode, id) => `ds-tree[data-mode="${mode}"] [data-node-id="${id}"]`;

const node = (mode, id) =>
  page.evaluate(`() => {
    const element = document.querySelector('${row(mode, id)}');
    const caret = element.querySelector('.caret-button');
    return {
      expanded: element.getAttribute('aria-expanded') === 'true',
      selected: element.getAttribute('aria-selected') === 'true',
      focused: document.activeElement === element,
      caretButton: caret
        ? { name: caret.getAttribute('aria-label'), tabindex: caret.getAttribute('tabindex') }
        : null,
    };
  }`);

const centre = (selector) =>
  page.evaluate(`() => {
    const box = document.querySelector('${selector}').getBoundingClientRect();
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }`);

const press = async (selector, { clickCount = 1, modifiers = 0 } = {}) => {
  const { x, y } = await centre(selector);
  for (let count = 1; count <= clickCount; count++) {
    for (const type of ['mousePressed', 'mouseReleased']) {
      await page.s('Input.dispatchMouseEvent', {
        type,
        x,
        y,
        button: 'left',
        buttons: type === 'mousePressed' ? 1 : 0,
        clickCount: count,
        modifiers,
      });
    }
  }
  await wait(100);
};

const key = async (mode, id, name) => {
  await page.evaluate(
    `() => document.querySelector('${row(mode, id)}').focus()`,
  );
  for (const type of ['keyDown', 'keyUp']) {
    await page.s('Input.dispatchKeyEvent', {
      type,
      key: name,
      code: name,
      windowsVirtualKeyCode: KEYS[name],
    });
  }
  await wait(100);
};

const label = (mode, id) => `${row(mode, id)} .label`;

try {
  for (let attempt = 0; attempt < 60; attempt++) {
    const ready = await page.evaluate(
      `() => !!document.querySelector('${row('doubleClick', 'beta')}')`,
    );
    if (ready) break;
    await wait(500);
  }

  // row: the row is the toggle.
  await press(label('row', 'alpha'));
  let alpha = await node('row', 'alpha');
  check(
    'row: click selects and expands',
    alpha.selected && alpha.expanded,
    alpha,
  );
  check('row: a parent has no caret button', alpha.caretButton === null, alpha);
  await key('row', 'alpha', 'Enter');
  alpha = await node('row', 'alpha');
  check('row: Enter collapses', alpha.selected && !alpha.expanded, alpha);

  // caret: the row selects, the chevron toggles.
  await press(label('caret', 'alpha'));
  alpha = await node('caret', 'alpha');
  check(
    'caret: click selects without expanding',
    alpha.selected && !alpha.expanded,
    alpha,
  );
  check(
    'caret: the chevron is a named button outside the tab order',
    alpha.caretButton?.name === 'Expand Alpha' &&
      alpha.caretButton?.tabindex === '-1',
    alpha.caretButton,
  );
  await press(`${row('caret', 'beta')} .caret-button`);
  let beta = await node('caret', 'beta');
  alpha = await node('caret', 'alpha');
  check(
    'caret: chevron click expands without selecting',
    beta.expanded && !beta.selected,
    beta,
  );
  check('caret: chevron click keeps the selection', alpha.selected, alpha);
  check('caret: chevron click leaves the focus on its row', beta.focused, beta);
  check(
    'caret: the expanded chevron is named Collapse',
    beta.caretButton?.name === 'Collapse Beta',
    beta.caretButton,
  );
  await press(`${row('caret', 'beta')} .caret-button`);
  beta = await node('caret', 'beta');
  check('caret: second chevron click collapses', !beta.expanded, beta);
  await key('caret', 'alpha', 'Enter');
  alpha = await node('caret', 'alpha');
  check(
    'caret: Enter selects without expanding',
    alpha.selected && !alpha.expanded,
    alpha,
  );
  await key('caret', 'alpha', 'ArrowRight');
  alpha = await node('caret', 'alpha');
  check('caret: ArrowRight expands', alpha.expanded, alpha);
  await key('caret', 'alpha', 'ArrowLeft');
  alpha = await node('caret', 'alpha');
  check('caret: ArrowLeft collapses', !alpha.expanded, alpha);
  await press(label('caret', 'beta'), { modifiers: CTRL });
  beta = await node('caret', 'beta');
  alpha = await node('caret', 'alpha');
  check(
    'caret: Ctrl-click adds to the selection without expanding',
    beta.selected && alpha.selected && !beta.expanded,
    { alpha, beta },
  );

  // doubleClick: a click selects, a double click toggles.
  await press(label('doubleClick', 'alpha'));
  alpha = await node('doubleClick', 'alpha');
  check(
    'doubleClick: click selects without expanding',
    alpha.selected && !alpha.expanded,
    alpha,
  );
  await press(label('doubleClick', 'alpha'), { clickCount: 2 });
  alpha = await node('doubleClick', 'alpha');
  check(
    'doubleClick: double click expands and keeps the row selected',
    alpha.selected && alpha.expanded,
    alpha,
  );
  await press(label('doubleClick', 'alpha'), { clickCount: 2 });
  alpha = await node('doubleClick', 'alpha');
  check(
    'doubleClick: second double click collapses',
    alpha.selected && !alpha.expanded,
    alpha,
  );
  await key('doubleClick', 'alpha', 'Enter');
  alpha = await node('doubleClick', 'alpha');
  check(
    'doubleClick: Enter selects without expanding',
    alpha.selected && !alpha.expanded,
    alpha,
  );
  await key('doubleClick', 'alpha', 'ArrowRight');
  alpha = await node('doubleClick', 'alpha');
  check('doubleClick: ArrowRight expands', alpha.expanded, alpha);
  await press(label('doubleClick', 'beta'), { clickCount: 2, modifiers: CTRL });
  beta = await node('doubleClick', 'beta');
  check('doubleClick: Ctrl-double-click does not toggle', !beta.expanded, beta);
} finally {
  await page.close();
}

process.exitCode = failures.length ? 1 : 0;
