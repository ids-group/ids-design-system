// Compares two ds-docs builds block by block and prints which blocks differ.
//
//   node tools/compare-docs-pixels.mjs <urlA> <urlB> [extraCssForB]
//
// Serve both builds first, for example with tools/serve-static.mjs on two ports. Exit code is 1 when any block
// differs, so this can gate a change that was meant to be visually neutral.
//
// Every infinite animation is paused at time zero and every finite one is finished before a screenshot, because
// a chart mid-transition differs from itself between runs and would drown the real differences.
import { open, wait } from './headless-chrome.mjs';

const [urlA, urlB, cssB = ''] = process.argv.slice(2);
if (!urlA || !urlB) {
  console.error(
    'usage: node tools/compare-docs-pixels.mjs <urlA> <urlB> [extraCssForB]',
  );
  process.exit(2);
}

const SETTLE_MS = 9000;
const SCROLL_SETTLE_MS = 250;
const CHANNEL_TOLERANCE = 8;

const settleAnimations = `for (const animation of document.getAnimations()) {
  if (animation.effect?.getTiming().iterations === Infinity) { animation.pause(); animation.currentTime = 0; }
  else animation.finish();
}`;

async function shots(url, css = '') {
  const injectCss = css
    ? `document.addEventListener('DOMContentLoaded', () => { const style = document.createElement('style'); style.textContent = ${JSON.stringify(css)}; document.head.append(style); });`
    : '';
  const { s, evaluate, close } = await open(url, {
    initScript: `window.__dsSectionsOnly = true;${injectCss}`,
  });
  try {
    await wait(SETTLE_MS);
    const count = await evaluate(
      `() => { document.documentElement.dataset.theme = 'light'; ${settleAnimations} return document.querySelectorAll('docs-section h3.block-title').length; }`,
    );
    const images = [];
    for (let index = 0; index < count; index++) {
      await evaluate(
        `() => { const heading = document.querySelectorAll('docs-section h3.block-title')[${index}];
           const main = document.querySelector('main.content');
           main.scrollTop += heading.getBoundingClientRect().top - 60;
           ${settleAnimations} }`,
      );
      await wait(SCROLL_SETTLE_MS);
      images.push((await s('Page.captureScreenshot', { format: 'png' })).data);
    }
    return images;
  } finally {
    await close();
  }
}

const a = await shots(urlA);
const b = await shots(urlB, cssB);

// Decoding and diffing happen inside a page: PNG decoding and getImageData are native there, and pulling
// hundreds of megabytes of pixels back over CDP would be slower than the screenshots themselves.
const { evaluate, close } = await open('about:blank');
const result = await evaluate(`async () => {
  const a = ${JSON.stringify(a)};
  const b = ${JSON.stringify(b)};
  const load = (data) => new Promise((resolve) => { const image = new Image(); image.onload = () => resolve(image); image.src = 'data:image/png;base64,' + data; });
  const differing = [];
  for (let index = 0; index < Math.min(a.length, b.length); index++) {
    const [left, right] = [await load(a[index]), await load(b[index])];
    const context = new OffscreenCanvas(left.width, left.height).getContext('2d');
    context.drawImage(left, 0, 0);
    const pixelsA = context.getImageData(0, 0, left.width, left.height).data;
    context.clearRect(0, 0, left.width, left.height);
    context.drawImage(right, 0, 0);
    const pixelsB = context.getImageData(0, 0, right.width, right.height).data;
    let count = 0;
    for (let p = 0; p < pixelsA.length; p += 4) {
      if (Math.abs(pixelsA[p] - pixelsB[p]) > ${CHANNEL_TOLERANCE}
        || Math.abs(pixelsA[p + 1] - pixelsB[p + 1]) > ${CHANNEL_TOLERANCE}
        || Math.abs(pixelsA[p + 2] - pixelsB[p + 2]) > ${CHANNEL_TOLERANCE}) count++;
    }
    if (count > 0) differing.push([index, count]);
  }
  return { blocksA: a.length, blocksB: b.length, differing };
}`);
await close();

console.log(JSON.stringify(result, null, 1));
if (result.blocksA !== result.blocksB) {
  console.error(`block count differs: ${result.blocksA} vs ${result.blocksB}`);
  process.exit(1);
}
process.exit(result.differing.length ? 1 : 0);
