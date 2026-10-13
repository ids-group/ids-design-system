#!/usr/bin/env node
// Does the render-evidence rule still FIRE on a one-pixel change, and still HOLD on an identical
// block and on a block that only moved? Synthetic sites shaped like ds-docs (a `main.content`
// scroller, a `section[data-anchor]`, `h3.block-title` chapters) differ by one pixel column in one
// block, or by half a pixel of height in the block above it, which moves the one below to a
// fractional position. The check runs over them as prebuilt dists, against private copies of the
// manifest and CHANGELOG, so nothing tracked is read as the subject or written.
//
//   node tools/check-render-evidence-selftest.mjs
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const work = mkdtempSync(join(tmpdir(), 'render-evidence-selftest-'));

const page = (widgetHeight, gadgetWidth) => `<!doctype html>
<html><head><style>
  body { margin: 0; font: 16px sans-serif; }
  main.content { height: 100vh; overflow: auto; }
  .box { display: block; height: 40px; border-radius: 50%; background: #1a4fd6; }
</style></head><body><main class="content">
  <section data-anchor="widget">
    <h2>Widget</h2>
    <h3 class="block-title">Same</h3>
    <ds-widget class="box" style="width: 40px; height: ${widgetHeight}px"></ds-widget>
    <h3 class="block-title">Moved</h3>
    <ds-gadget class="box ds-gadget" style="width: ${gadgetWidth}px"></ds-gadget>
  </section>
</main></body></html>`;

for (const [name, widgetHeight, gadgetWidth] of [
  ['before', 40, 40],
  ['after', 40, 41],
  ['pushed', 40.5, 40],
  ['pushed-and-wider', 40.5, 41],
]) {
  mkdirSync(join(work, name));
  writeFileSync(
    join(work, name, 'index.html'),
    page(widgetHeight, gadgetWidth),
  );
}

function run(after, manifest, changelog = '') {
  const migrations = join(work, 'migrations');
  mkdirSync(migrations, { recursive: true });
  writeFileSync(join(migrations, 'unreleased.json'), JSON.stringify(manifest));
  writeFileSync(
    join(work, 'CHANGELOG.md'),
    `# Changelog\n\n## Unreleased\n\n${changelog}\n\n## 0.0.1\n\n- \`ds-gadget\` named in an older block.\n`,
  );
  const result = spawnSync(
    process.execPath,
    [
      join(ROOT, 'tools/check-render-evidence.mjs'),
      '--dists',
      join(work, 'before'),
      join(work, after),
    ],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        DS_MIGRATIONS_DIR: migrations,
        DS_CHANGELOG_PATH: join(work, 'CHANGELOG.md'),
      },
    },
  );
  return { status: result.status, output: result.stdout + result.stderr };
}

const cases = [
  {
    name: 'FIRES on a 1px change only an older release names, and on pixels: evidence that does not hold',
    after: 'after',
    manifest: {
      items: [
        { id: 'claims-moved', evidence: ['pixels:widget/moved'] },
        { id: 'claims-missing', evidence: ['pixels:widget/nowhere'] },
        { id: 'claims-same', evidence: ['pixels:widget/same'] },
      ],
    },
    status: 1,
    present: [
      /UNNAMED\s+changed\s+widget\/moved\s+none of: ds-gadget/,
      /BAD\s+pixels:widget\/moved .*differs/,
      /BAD\s+pixels:widget\/nowhere .*names no docs block/,
      /ok\s+pixels:widget\/same/,
    ],
    absent: [/(named|UNNAMED)\s+\w+\s+widget(\/same)?\s/],
  },
  {
    name: 'HOLDS when ## Unreleased names the component of the differing block',
    after: 'after',
    manifest: {
      items: [{ id: 'claims-same', evidence: ['pixels:widget/same'] }],
    },
    changelog: '- `ds-gadget` is one pixel wider.',
    status: 0,
    present: [/named\s+changed\s+widget\/moved\s+by ds-gadget/, /1 differ/],
    absent: [/UNNAMED/, /BAD/],
  },
  {
    name: 'HOLDS on a block that only moved half a pixel down, once captured at the same position',
    after: 'pushed',
    manifest: { items: [] },
    changelog: '- `ds-widget` is half a pixel taller.',
    status: 0,
    present: [
      /1 differ/,
      /named\s+changed\s+widget\/same\s+by ds-widget/,
      /1 moved block\(s\) captured again/,
    ],
    absent: [/widget\/moved/, /UNNAMED/],
  },
  {
    name: 'FIRES on a block that moved and changed, once captured at the same position',
    after: 'pushed-and-wider',
    manifest: { items: [] },
    changelog: '- `ds-widget` is half a pixel taller.',
    status: 1,
    present: [
      /UNNAMED\s+changed\s+widget\/moved\s+none of: ds-gadget/,
      /1 moved block\(s\) captured again/,
    ],
    absent: [],
  },
  {
    name: 'HOLDS on an identical pair, where pixels: on any block is good evidence',
    after: 'before',
    manifest: {
      items: [{ id: 'claims-moved', evidence: ['pixels:widget/moved'] }],
    },
    status: 0,
    present: [/3 \/ 3 block\(s\), 0 differ/, /ok\s+pixels:widget\/moved/],
    absent: [/UNNAMED/, /BAD/],
  },
];

let failed = 0;
try {
  for (const testCase of cases) {
    const { status, output } = run(
      testCase.after,
      testCase.manifest,
      testCase.changelog,
    );
    const problems = [
      ...(status === testCase.status
        ? []
        : [`exit ${status}, expected ${testCase.status}`]),
      ...testCase.present
        .filter((pattern) => !pattern.test(output))
        .map((pattern) => `missing ${pattern}`),
      ...testCase.absent
        .filter((pattern) => pattern.test(output))
        .map((pattern) => `unexpected ${pattern}`),
    ];
    if (problems.length) {
      failed++;
      console.error(
        `FAIL  ${testCase.name}\n  ${problems.join('\n  ')}\n${output}`,
      );
    } else console.log(`ok    ${testCase.name}`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (failed) {
  console.error(`\ncheck-render-evidence-selftest: ${failed} case(s) failed`);
  process.exit(1);
}
console.log(`\ncheck-render-evidence-selftest: ${cases.length} case(s) passed`);
