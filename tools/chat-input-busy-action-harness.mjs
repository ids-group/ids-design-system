// Drives ds-chat-input with busyAction="queue" on the docs app's dev-only
// /harness/chat-input-busy-action page: empty, the only button is Stop; typed, the buttons are
// Redirect, Stop and Queue with the send, stop and list-plus icons, Enter and Queue emit `queued`,
// Redirect emits `redirected` and Stop emits `stopRequested`.
// Exits 1 on any mismatch.
//
//   node tools/chat-input-busy-action-harness.mjs <docsUrl>
//
// Serve the docs app first (`ng serve ds-docs --port <port>`); the route exists in dev mode only.
import { open, wait } from './headless-chrome.mjs';

const [docsUrl] = process.argv.slice(2);
const page = await open(`${docsUrl}/harness/chat-input-busy-action`, {
  chromePath: process.env.CHROME_PATH,
});
const read = () =>
  page.evaluate(() => ({
    buttons: [...document.querySelectorAll('ds-chat-input .send button')].map(
      (button) => button.getAttribute('aria-label') || button.textContent.trim(),
    ),
    icons: [...document.querySelectorAll('ds-chat-input .send button svg')].map(
      (svg) => svg.firstElementChild?.getAttribute('d') ?? svg.firstElementChild?.localName,
    ),
    events: document.querySelector('#events').textContent,
  }));
const press = (label) =>
  page.evaluate(
    `() => [...document.querySelectorAll('ds-chat-input .send button')].find((b) => b.getAttribute('aria-label') === ${JSON.stringify(label)}).click()`,
  );
const failures = [];
const expect = (name, actual, expected) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push(`${name}: got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`);
  }
};
try {
  await wait(1500);
  expect('empty', (await read()).buttons, ['Stop']);

  await page.evaluate(() => document.querySelector('ds-chat-input textarea').focus());
  await page.s('Input.insertText', { text: 'Queue me' });
  await wait(200);
  expect('typed', (await read()).buttons, ['Redirect now', 'Stop', 'Queue']);
  expect('icons', (await read()).icons.map((d) => d.slice(0, 7)), ['M14.536', 'rect', 'M11 12H']);

  await page.s('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await page.s('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await wait(200);
  await press('Queue');
  await wait(100);
  await press('Redirect now');
  await wait(100);
  await press('Stop');
  await wait(200);
  expect('events', (await read()).events, 'queued:Queue me;queued:Queue me;redirected:Queue me;stop;');

  console.log(failures.length ? failures.join('\n') : 'OK');
  process.exitCode = failures.length ? 1 : 0;
} finally {
  await page.close();
}
