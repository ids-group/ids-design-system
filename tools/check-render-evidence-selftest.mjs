#!/usr/bin/env node
// Does the render-evidence rule still FIRE on a one-pixel change, and still HOLD on an identical
// block and on a block that only moved? Synthetic sites shaped like ds-docs (a `main.content`
// scroller, a `section[data-anchor]`, `h3.block-title` chapters) differ by one pixel column in one
// block, or by half a pixel of height in the block above it, which moves the one below to a
// fractional position, or by a token a docs rule reads in a block whose markup names nothing of the
// library, or by a tint a few levels apart on a hairline or across a whole panel. The check runs over them as prebuilt dists, against private copies of the
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

const page = (
  widgetHeight,
  gadgetWidth,
  linkToken,
  hairColor = '#1a4fd6',
  panelColor = '#f8f9fb',
) => `<!doctype html>
<html><head><style>
  body { margin: 0; font: 16px sans-serif; }
  main.content { height: 100vh; overflow: auto; }
  .box { display: block; height: 40px; border-radius: 50%; background: #1a4fd6; }
  .plain-link { color: var(--text-link); }
  ${linkToken ? ':root { --text-link: #1a4fd6; }' : ''}
  .hair { display: block; width: 40px; height: 1px; background: ${hairColor}; }
  .panel { display: block; width: 400px; height: 200px; background: ${panelColor}; }
</style></head><body><main class="content">
  <section data-anchor="widget">
    <h2>Widget</h2>
    <h3 class="block-title">Same</h3>
    <ds-widget class="box" style="width: 40px; height: ${widgetHeight}px"></ds-widget>
    <h3 class="block-title">Moved</h3>
    <ds-gadget class="box ds-gadget" style="width: ${gadgetWidth}px"></ds-gadget>
  </section>
  <section data-anchor="prose">
    <h3 class="block-title">Link</h3>
    <a class="plain-link">Read the guide</a>
  </section>
  <section data-anchor="tone">
    <h3 class="block-title">Hair</h3>
    <ds-hair class="hair"></ds-hair>
    <h3 class="block-title">Panel</h3>
    <ds-panel class="panel"></ds-panel>
  </section>
</main></body></html>`;

for (const [name, widgetHeight, gadgetWidth, linkToken, hair, panel] of [
  ['before', 40, 40, true],
  ['token-removed', 40, 40, false],
  ['after', 40, 41, true],
  ['pushed', 40.5, 40, true],
  ['pushed-and-wider', 40.5, 41, true],
  ['hair-tinted', 40, 40, true, '#1c51d8'],
  ['panel-tinted', 40, 40, true, '#1a4fd6', '#f5f6f8'],
]) {
  mkdirSync(join(work, name));
  writeFileSync(
    join(work, name, 'index.html'),
    page(widgetHeight, gadgetWidth, linkToken, hair, panel),
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
      /4 moved block\(s\) captured again/,
    ],
    absent: [/widget\/moved/, /prose\/link/, /tone\//, /UNNAMED/],
  },
  {
    name: 'FIRES on a block that moved and changed, once captured at the same position',
    after: 'pushed-and-wider',
    manifest: { items: [] },
    changelog: '- `ds-widget` is half a pixel taller.',
    status: 1,
    present: [
      /UNNAMED\s+changed\s+widget\/moved\s+none of: ds-gadget/,
      /4 moved block\(s\) captured again/,
    ],
    absent: [],
  },
  {
    name: 'HOLDS when a removed-api item withdraws a token a docs rule in the block reads',
    after: 'token-removed',
    manifest: {
      items: [
        { id: 'text-link-removed', kind: 'removed-api', old: '--text-link' },
      ],
    },
    status: 0,
    present: [/1 differ/, /named\s+changed\s+prose\/link\s+by --text-link/],
    absent: [/UNNAMED/],
  },
  {
    name: 'FIRES when only the ## Unreleased prose names the token a docs rule reads',
    after: 'token-removed',
    manifest: { items: [] },
    changelog: '- `--text-link` is removed.',
    status: 1,
    present: [/UNNAMED\s+changed\s+prose\/link\s/],
    absent: [/named\s+changed\s+prose\/link/],
  },
  {
    name: 'FIRES when a removed-api item withdraws only a longer token of the same stem',
    after: 'token-removed',
    manifest: {
      items: [
        {
          id: 'text-link-hover-removed',
          kind: 'removed-api',
          old: '--text-link-hover',
        },
      ],
    },
    status: 1,
    present: [/UNNAMED\s+changed\s+prose\/link\s/],
    absent: [/named\s+changed\s+prose\/link/],
  },
  {
    name: 'HOLDS on an identical pair, where pixels: on any block is good evidence',
    after: 'before',
    manifest: {
      items: [{ id: 'claims-moved', evidence: ['pixels:widget/moved'] }],
    },
    status: 0,
    present: [/8 \/ 8 block\(s\), 0 differ/, /ok\s+pixels:widget\/moved/],
    absent: [/UNNAMED/, /BAD/],
  },
  {
    name: 'HOLDS on a hairline two levels apart, as antialiasing differs',
    after: 'hair-tinted',
    manifest: { items: [] },
    status: 0,
    present: [/0 differ/, /1 block\(s\) differ by antialiasing only/],
    absent: [/UNNAMED/],
  },
  {
    name: 'FIRES on a whole panel three levels apart, a tint and not antialiasing',
    after: 'panel-tinted',
    manifest: { items: [] },
    status: 1,
    present: [/UNNAMED\s+changed\s+tone\/panel\s/],
    absent: [/differ by antialiasing only/],
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
