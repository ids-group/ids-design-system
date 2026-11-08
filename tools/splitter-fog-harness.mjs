// Drags the `dragFog` ds-splitter on the docs app's dev-only /harness/splitter-fog page each way, past
// its limit and back, and checks the fog is on the side the hand moves towards, rides the rubber band,
// clears on release, and that at rest the splitter paints the same pixels as one without the fog.
// Exits 1 on any failed check.
//
//   node tools/splitter-fog-harness.mjs <docsUrl>
//
// Serve the docs app first (`ng serve ds-docs --port <port>`); the route exists in dev mode only.
import { open, wait } from './headless-chrome.mjs';

const [docsUrl] = process.argv.slice(2);
const page = await open(`${docsUrl}/harness/splitter-fog`, {
  chromePath: process.env.CHROME_PATH,
});
const failures = [];
const check = (name, ok, detail) => {
  console.log(
    `${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ` ${JSON.stringify(detail)}` : ''}`,
  );
  if (!ok) failures.push(name);
};

const fogState = () =>
  page.evaluate(() => {
    const host = document.querySelector('ds-splitter[data-fog="true"]');
    const read = (selector) => host.querySelector(selector);
    return {
      start: read('.fog-start').style.opacity,
      end: read('.fog-end').style.opacity,
      startComputed: getComputedStyle(read('.fog-start')).opacity,
      endComputed: getComputedStyle(read('.fog-end')).opacity,
      paneTransform: read('.pane-start').style.transform,
      fogTransform: read('.fog-start').style.transform,
    };
  });

const handleAt = () =>
  page.evaluate(() => {
    const box = document
      .querySelector('ds-splitter[data-fog="true"] .handle')
      .getBoundingClientRect();
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  });

const restPixels = async () => {
  const shots = [];
  for (const fog of ['false', 'true']) {
    const clip = await page.evaluate(`() => {
      const box = document.querySelector('ds-splitter[data-fog="${fog}"]').getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height, scale: 1 };
    }`);
    shots.push(
      (await page.s('Page.captureScreenshot', { format: 'png', clip })).data,
    );
  }
  return shots[0] === shots[1];
};

let pointer = null;
const mouse = (type, x, extra = {}) =>
  page.s('Input.dispatchMouseEvent', {
    type,
    x,
    y: pointer.y,
    button: 'left',
    ...extra,
  });
const press = async () => {
  pointer = await handleAt();
  await mouse('mouseMoved', pointer.x, { button: 'none' });
  await mouse('mousePressed', pointer.x, { buttons: 1, clickCount: 1 });
};
const move = async (by, steps) => {
  for (let step = 1; step <= steps; step++) {
    await mouse('mouseMoved', pointer.x + (by * step) / steps, { buttons: 1 });
    await wait(16);
  }
  pointer.x += by;
};
const release = () =>
  mouse('mouseReleased', pointer.x, { buttons: 0, clickCount: 1 });
const cleared = (state) =>
  !state.start &&
  !state.end &&
  state.startComputed === '0' &&
  state.endComputed === '0';

try {
  await wait(1500);
  check('at rest, same pixels as without the fog', await restPixels());

  await press();
  await move(150, 10);
  let state = await fogState();
  check(
    'drag towards end: fog on the end pane only',
    Number(state.end) > 0 && !state.start,
    state,
  );
  await release();
  await wait(600);
  state = await fogState();
  check('released: fog cleared', cleared(state), state);

  // From 450px to 100px below the 200px min: the rubber band squashes the start pane.
  await press();
  await move(-350, 14);
  state = await fogState();
  check(
    'drag towards start past min: fog on the start pane only',
    Number(state.start) > 0 && !state.end,
    state,
  );
  check(
    'past min: fog rides the pane transform',
    !!state.paneTransform && state.fogTransform === state.paneTransform,
    state,
  );
  // Back towards the end while the pointer is still past the limit: the fog turns with the hand.
  await move(60, 20);
  state = await fogState();
  check(
    'pulling back while past min: fog on the end pane only',
    Number(state.end) > 0 && !state.start,
    state,
  );
  await release();
  await wait(1000);
  state = await fogState();
  check(
    'released past min: fog cleared, transforms gone',
    cleared(state) && !state.fogTransform,
    state,
  );

  await page.evaluate(() =>
    document
      .querySelector('ds-splitter[data-fog="true"] .handle')
      .dispatchEvent(new MouseEvent('dblclick', { bubbles: true })),
  );
  await page.s('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 4, y: 4 });
  await wait(800);
  check(
    'after the drags and a reset, same pixels as without the fog',
    await restPixels(),
  );
} finally {
  await page.close();
}
process.exitCode = failures.length ? 1 : 0;
