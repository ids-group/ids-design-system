// Clicks, double-clicks and keys through the three `toggleOn` modes of ds-tree on the docs app's
// dev-only /harness/tree-toggle page, and checks which of them select a parent and which expand or
// collapse it, then that the rows a toggle reveals or hides run the fold animation unless
// `[animate]="false"` or reduced motion turns it off, and that a shrink-to-fit tree keeps its row
// width through the fold. Exits 1 on any failed check.
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
  // Motion: read the animations a toggle starts rather than timing them, which a background tab
  // would throttle.
  const toggleAndRead = (mode, id) =>
    page.evaluate(`async () => {
      const tree = document.querySelector('ds-tree[data-mode="${mode}"]');
      const parent = tree.querySelector('[data-node-id="${id}"]');
      parent.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      const shells = [...tree.querySelectorAll('.row-shell')].filter(
        (shell) => shell.querySelector('[data-node-id^="${id}-"]'),
      );
      const caret = parent.querySelector('.caret');
      return {
        expanded: parent.getAttribute('aria-expanded') === 'true',
        shells: shells.map((shell) => ({
          className: shell.className,
          animations: shell.getAnimations().map((animation) => ({
            name: animation.animationName,
            duration: animation.effect.getTiming().duration,
          })),
        })),
        caretTransform: getComputedStyle(caret).transform,
        caretTurning: caret
          .getAnimations()
          .some((animation) => animation.transitionProperty === 'transform'),
        caretTransition: getComputedStyle(caret).transitionDuration,
      };
    }`);
  const folds = (state, name) =>
    state.shells.length > 0 &&
    state.shells.every((shell) =>
      shell.animations.some(
        (animation) => animation.name.endsWith(name) && animation.duration > 0,
      ),
    );
  const rotated = (transform) =>
    /^matrix\((-?0(\.0+)?|[-\d.e]+), 1,/.test(transform);

  await page.evaluate(
    `() => { document.querySelector('ds-tree[data-mode="row"]').scrollIntoView(); }`,
  );
  let motion = await toggleAndRead('row', 'beta');
  check(
    'motion: expanding folds the revealed rows open',
    motion.expanded && folds(motion, 'ds-tree-row-expand'),
    motion,
  );
  check('motion: the chevron turn is animated', motion.caretTurning, motion);
  motion = await toggleAndRead('row', 'beta');
  check(
    'motion: collapsing folds the hidden rows shut',
    !motion.expanded && folds(motion, 'ds-tree-row-collapse'),
    motion,
  );
  await wait(600);

  motion = await toggleAndRead('static', 'alpha');
  check(
    'motion: animate=false shows the rows without an animation',
    motion.expanded &&
      motion.shells.length === 2 &&
      motion.shells.every((shell) => shell.animations.length === 0),
    motion,
  );
  check(
    'motion: animate=false turns the chevron a quarter at once',
    !motion.caretTurning && rotated(motion.caretTransform),
    motion,
  );
  motion = await toggleAndRead('static', 'alpha');
  check(
    'motion: animate=false removes the rows at once',
    !motion.expanded && motion.shells.length === 0,
    motion,
  );

  // Width: a shrink-to-fit tree steps through its fold animations frame by frame, and the parent
  // row keeps one width from the first frame to after the rows are added or removed.
  const widthsThroughFold = () =>
    page.evaluate(`async () => {
      const tree = document.querySelector('ds-tree[data-mode="fit"]');
      const parent = tree.querySelector('[data-node-id="fit"]');
      const width = () => Math.round(parent.getBoundingClientRect().width * 100) / 100;
      parent.click();
      let animations = [];
      for (let attempt = 0; attempt < 100 && !animations.length; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 1));
        animations = tree
          .getAnimations({ subtree: true })
          .filter((animation) => /ds-tree-row-/.test(animation.animationName ?? ''));
      }
      animations.forEach((animation) => animation.pause());
      const widths = [];
      for (let time = 0; time <= 180; time += 20) {
        animations.forEach((animation) => (animation.currentTime = time));
        widths.push(width());
      }
      animations.forEach((animation) => animation.finish());
      await new Promise((resolve) => setTimeout(resolve, 100));
      widths.push(width());
      return {
        expanded: parent.getAttribute('aria-expanded') === 'true',
        stepped: animations.length,
        widths,
      };
    }`);
  const steady = (state) =>
    state.stepped > 0 && new Set(state.widths).size === 1;
  let fold = await widthsThroughFold();
  check(
    'width: expanding keeps the row width through the fold',
    fold.expanded && steady(fold),
    fold,
  );
  fold = await widthsThroughFold();
  check(
    'width: collapsing keeps the row width through the fold',
    !fold.expanded && steady(fold),
    fold,
  );

  await page.s('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  motion = await toggleAndRead('row', 'beta');
  check(
    'motion: reduced motion shows the rows without an animation',
    motion.expanded &&
      motion.shells.every(
        (shell) =>
          !shell.animations.some((animation) => animation.duration > 0),
      ),
    motion,
  );
  await page.s('Emulation.setEmulatedMedia', { features: [] });
} finally {
  await page.close();
}

process.exitCode = failures.length ? 1 : 0;
