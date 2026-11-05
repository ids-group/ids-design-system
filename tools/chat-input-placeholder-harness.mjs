// Measures the ds-chat-input frame on the docs app's dev-only /harness/chat-input-placeholder page
// empty, under a placeholder longer than the field, and with one character typed; exits 1 when the
// two heights differ.
//
//   node tools/chat-input-placeholder-harness.mjs <docsUrl>
//
// Serve the docs app first (`ng serve ds-docs --port <port>`); the route exists in dev mode only.
import { open, wait } from './headless-chrome.mjs';

const [docsUrl] = process.argv.slice(2);
const page = await open(`${docsUrl}/harness/chat-input-placeholder`, {
  chromePath: process.env.CHROME_PATH,
});
const frameHeight = () =>
  page.evaluate(() => document.querySelector('ds-chat-input .frame').getBoundingClientRect().height);
try {
  await wait(1500);
  const empty = await frameHeight();
  await page.evaluate(() => document.querySelector('ds-chat-input textarea').focus());
  await page.s('Input.insertText', { text: 'x' });
  await wait(200);
  const typed = await frameHeight();
  console.log(JSON.stringify({ empty, typed }));
  process.exitCode = typed > 0 && empty === typed ? 0 : 1;
} finally {
  await page.close();
}
