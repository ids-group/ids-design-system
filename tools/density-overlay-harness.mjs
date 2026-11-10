// Opens a ds-popover holding a ds-tree on the docs app's dev-only /harness/density-overlay page,
// once per tier, and reads the portaled panel's padding and the tree row's padding and height.
// Exits 1 unless the panel follows the tier of the screen that opened it.
//
//   node tools/density-overlay-harness.mjs <docsUrl>
//
// Serve the docs app first (`ng serve ds-docs --port <port>`); the route exists in dev mode only.
import { open, wait } from './headless-chrome.mjs';

const [docsUrl] = process.argv.slice(2);
const expected = {
  cozy: { panel: '12px', row: '6px 12px' },
  compact: { panel: '12px', row: '4px 8px' },
  'ultra-compact': { panel: '8px', row: '4px 8px' },
};
const failures = [];
for (const [density, want] of Object.entries(expected)) {
  const page = await open(`${docsUrl}/harness/density-overlay?density=${density}`, {
    chromePath: process.env.CHROME_PATH,
  });
  try {
    await wait(1500);
    await page.evaluate(() => document.querySelector('#trigger button').click());
    await wait(500);
    const got = await page.evaluate(() => {
      const panel = document.querySelector('.cdk-overlay-container .popover');
      const row = panel?.querySelector('.row');
      if (!row) return null;
      const style = getComputedStyle(row);
      return {
        panel: getComputedStyle(panel).padding,
        row: `${style.paddingTop} ${style.paddingRight}`,
        height: row.getBoundingClientRect().height,
      };
    });
    console.log(density, JSON.stringify(got));
    if (!got || got.panel !== want.panel || got.row !== want.row) {
      failures.push(`${density}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
    }
  } finally {
    await page.close();
  }
}
console.log(failures.length ? failures.join('\n') : 'OK');
process.exitCode = failures.length ? 1 : 0;
