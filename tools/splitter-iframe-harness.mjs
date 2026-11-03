// Drags the ds-splitter handle on the docs app's dev-only /harness/splitter-iframe page and releases
// it over the iframe in the end pane; exits 1 when the page still reports a drag afterwards.
//
//   node tools/splitter-iframe-harness.mjs <docsUrl> [screenshot.png]
//
// Serve the docs app first (`ng serve ds-docs --port <port>`); the route exists in dev mode only.
import { writeFileSync } from 'node:fs';
import { open, wait } from './headless-chrome.mjs';

const [docsUrl, screenshot] = process.argv.slice(2);
const page = await open(`${docsUrl}/harness/splitter-iframe`, {
  chromePath: process.env.CHROME_PATH,
});
try {
  await wait(1500);
  const box = await page.evaluate(() => {
    const handle = document.querySelector('ds-splitter .handle').getBoundingClientRect();
    const frame = document.querySelector('ds-splitter iframe').getBoundingClientRect();
    return {
      x: handle.x + handle.width / 2,
      y: handle.y + handle.height / 2,
      overX: frame.x + frame.width / 2,
    };
  });
  const mouse = (type, x, extra = {}) =>
    page.s('Input.dispatchMouseEvent', { type, x, y: box.y, button: 'left', ...extra });
  await mouse('mouseMoved', box.x, { button: 'none' });
  await mouse('mousePressed', box.x, { buttons: 1, clickCount: 1 });
  for (let step = 1; step <= 10; step++) {
    await mouse('mouseMoved', box.x + ((box.overX - box.x) * step) / 10, { buttons: 1 });
    await wait(16);
  }
  await mouse('mouseReleased', box.overX, { buttons: 0, clickCount: 1 });
  await mouse('mouseMoved', box.overX - 400, { button: 'none' });
  await wait(300);

  const state = await page.evaluate(() => ({
    dragging: document.documentElement.hasAttribute('data-ds-splitter-dragging'),
    cursor: getComputedStyle(document.body).cursor,
  }));
  if (screenshot) {
    // A screenshot carries no pointer: draw where it rests and what cursor the page gives it.
    const clip = await page.evaluate(`() => {
      const splitter = document.querySelector('ds-splitter').getBoundingClientRect();
      const label = document.createElement('div');
      label.textContent = 'cursor: ${state.cursor}' + (${state.dragging} ? ' · data-ds-splitter-dragging' : '');
      label.style.cssText = 'position:fixed;left:${box.overX - 400}px;top:${box.y}px;padding:4px 8px;font:13px monospace;background:#111;color:#fff;border-radius:4px;pointer-events:none';
      document.body.append(label);
      return { x: splitter.x - 8, y: splitter.y - 8, width: splitter.width + 16, height: splitter.height + 16, scale: 1 };
    }`);
    const { data } = await page.s('Page.captureScreenshot', { format: 'png', clip });
    writeFileSync(screenshot, Buffer.from(data, 'base64'));
  }
  console.log(JSON.stringify(state));
  process.exitCode = !state.dragging && state.cursor === 'auto' ? 0 : 1;
} finally {
  await page.close();
}
