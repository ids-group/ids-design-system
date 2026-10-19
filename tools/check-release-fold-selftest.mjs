#!/usr/bin/env node
// Drives the prerelease rules end to end on fixtures: the beta counter, the tag order and each
// manifest's boundary, and the fold that moves beta blocks and manifests into the stable release.
//
//   node tools/check-release-fold-selftest.mjs
import {
  compareVersions,
  devVersion,
  nextBeta,
  previousBoundary,
} from './release-tags.mjs';
import {
  foldChangelog,
  foldManifests,
  unreleasedHasEntry,
} from './release-fold.mjs';

let ran = 0;
let failed = 0;
function expect(name, actual, expected) {
  ran++;
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failed++;
  console.log(
    `${ok ? 'ok   ' : 'FAIL '} ${name}${ok ? '' : `\n      got      ${JSON.stringify(actual)}\n      expected ${JSON.stringify(expected)}`}`,
  );
}
function expectThrow(name, action) {
  ran++;
  let threw = false;
  try {
    action();
  } catch {
    threw = true;
  }
  if (!threw) failed++;
  console.log(`${threw ? 'ok   ' : 'FAIL '} ${name}`);
}

expect(
  'a beta after a stable starts at 1',
  nextBeta('0.14.5'),
  '0.14.6-beta.1',
);
expect(
  'a beta after a beta moves only the counter',
  nextBeta('0.14.6-beta.1'),
  '0.14.6-beta.2',
);
expect(
  'the counter is numeric, not text',
  nextBeta('0.14.6-beta.9'),
  '0.14.6-beta.10',
);
expectThrow('a prerelease that is not beta.N is refused', () =>
  nextBeta('0.14.6-rc.1'),
);

const tags = [
  'v0.14.6',
  'v0.14.6-beta.10',
  'v0.14.5',
  'v0.14.6-beta.2',
  'v0.9.0',
].sort((a, b) => compareVersions(a.slice(1), b.slice(1)));
expect('prereleases sort before their release, numerically', tags, [
  'v0.9.0',
  'v0.14.5',
  'v0.14.6-beta.2',
  'v0.14.6-beta.10',
  'v0.14.6',
]);
expect(
  'a stable boundary skips the betas it absorbed',
  previousBoundary(tags, '0.14.6'),
  'v0.14.5',
);
expect(
  'a beta boundary is the tag right before it',
  previousBoundary(tags, '0.14.6-beta.10'),
  'v0.14.6-beta.2',
);
expect(
  'the first beta starts at the last stable',
  previousBoundary(tags, '0.14.6-beta.2'),
  'v0.14.5',
);
expect(
  'the earliest tag has no boundary',
  previousBoundary(tags, '0.9.0'),
  null,
);

const stamped = [
  '# Changelog',
  '',
  '## Unreleased',
  '',
  '## 0.14.6 — 2026-10-02',
  '',
  '### Fixed',
  '',
  '- **Fix after beta 2.**',
  '',
  '## 0.14.6-beta.2 — 2026-10-01',
  '',
  '### Added',
  '',
  '- **Added in beta 2.**',
  '',
  '```md',
  '## 9.9.9-beta.1 — fenced, not a block',
  '```',
  '',
  '## 0.14.6-beta.1 — 2026-09-30',
  '',
  '### Added',
  '',
  '- **Added in beta 1.**',
  '',
  '### Fixed',
  '',
  '- **Fixed in beta 1.**',
  '',
  '## 0.14.5 — 2026-09-29',
  '',
  '### Fixed',
  '',
  '- **Stays where it is.**',
  '',
].join('\n');
const { text, folded } = foldChangelog(stamped, '0.14.6');
expect('every beta block since the last stable is folded', folded, [
  '0.14.6-beta.2',
  '0.14.6-beta.1',
]);
expect(
  'the stable block holds every entry once, sections merged in slot order, newest first',
  text,
  [
    '# Changelog',
    '',
    '## Unreleased',
    '',
    '## 0.14.6 — 2026-10-02',
    '',
    '### Added',
    '',
    '- **Added in beta 2.**',
    '',
    '```md',
    '## 9.9.9-beta.1 — fenced, not a block',
    '```',
    '',
    '- **Added in beta 1.**',
    '',
    '### Fixed',
    '',
    '- **Fix after beta 2.**',
    '',
    '- **Fixed in beta 1.**',
    '',
    '## 0.14.5 — 2026-09-29',
    '',
    '### Fixed',
    '',
    '- **Stays where it is.**',
    '',
  ].join('\n'),
);
expect(
  'a stable with no beta above it is left alone',
  foldChangelog(
    stamped.replace(/## 0\.14\.6-beta\.\d — /g, '## 0.14.5 — '),
    '0.14.6',
  ).folded,
  [],
);

const beta1 = {
  version: '0.14.6-beta.1',
  items: [{ id: 'a' }],
  informational: ['one'],
  deleteList: [],
};
const beta2 = {
  version: '0.14.6-beta.2',
  items: [{ id: 'b' }],
  informational: [],
  deleteList: [{ id: 'd' }],
};
const draft = {
  version: 'unreleased',
  items: [{ id: 'c' }],
  informational: ['two'],
  deleteList: [],
};
expect(
  'manifests fold oldest first under the stable version',
  foldManifests('0.14.6', [beta1, beta2, draft]),
  {
    version: '0.14.6',
    items: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    informational: ['one', 'two'],
    deleteList: [{ id: 'd' }],
  },
);
expectThrow('an item id repeated across the cycle is refused', () =>
  foldManifests('0.14.6', [beta1, { ...draft, items: [{ id: 'a' }] }]),
);
expectThrow('a deleteList id repeated across the cycle is refused', () =>
  foldManifests('0.14.6', [beta2, { ...draft, deleteList: [{ id: 'd' }] }]),
);
expect(
  'a supersedes link into a folded beta points at the stable, one outside the cycle is kept',
  foldManifests('0.14.6', [
    beta1,
    {
      ...draft,
      items: [{ id: 'c', supersedes: ['0.14.6-beta.1#a', '0.14.5#z'] }],
    },
  ]).items[1].supersedes,
  ['0.14.6#a', '0.14.5#z'],
);
expectThrow('an unknown manifest key is refused rather than dropped', () =>
  foldManifests('0.14.6', [{ ...beta1, notes: 'x' }]),
);

const devLog =
  '## Unreleased\r\n\r\n### Fixed\r\n\r\n- **A fix.**\r\n\r\n## 0.15.2 — 2026-10-14\r\n\r\n- **Old.**\r\n';
expect(
  'a dev changelog has an Unreleased entry',
  unreleasedHasEntry(devLog),
  true,
);
expect(
  'the release stamp leaves Unreleased without an entry',
  unreleasedHasEntry(
    foldChangelog(
      devLog
        .replace(/\r\n/g, '\n')
        .replace(/^## Unreleased$/m, '## Unreleased\n\n## 0.15.3 — 2026-10-19'),
      '0.15.3',
    ).text,
  ),
  false,
);

const unreleased = (body) =>
  unreleasedHasEntry(
    `# Changelog\n\n${body}\n## 0.15.2 — 2026-10-14\n\n- **Old.**\n`,
  );
expect(
  'prose, a star bullet or a trailing-space heading counts as an Unreleased entry',
  [
    unreleased('## Unreleased\n\nA paragraph.\n'),
    unreleased('## Unreleased\n\n### Fixed\n\n* **A fix.**\n'),
    unreleased('## Unreleased \n\n- **A fix.**\n'),
  ],
  [true, true, true],
);
expect(
  'headings and blank lines alone are no Unreleased entry',
  unreleased('## Unreleased\n\n### Added\n\n### Fixed\n\n'),
  false,
);
expect(
  'a fenced block under Unreleased is an entry',
  unreleased('## Unreleased\n\n```ts\n- x\n```\n'),
  true,
);
expect(
  'a dev build is the next patch with a g-prefixed sha, dirty marked',
  [
    devVersion('0.15.2', '0123456', false),
    devVersion('0.15.3-beta.1', 'abc1234', true),
    devVersion('0.15.2', null, false),
  ],
  ['0.15.3-dev.g0123456', '0.15.3-dev.gabc1234.dirty', '0.15.3-dev.local'],
);
expect(
  'a dev build sorts between the release it follows and the next one',
  ['0.15.3', '0.15.3-dev.g0123456', '0.15.2', '0.15.3-beta.1'].sort(
    compareVersions,
  ),
  ['0.15.2', '0.15.3-beta.1', '0.15.3-dev.g0123456', '0.15.3'],
);
expect(
  'a prerelease with a second hyphen keeps it in the comparison',
  compareVersions('0.15.3-dev.g1-a', '0.15.3-dev.g1-b'),
  -1,
);

console.log(`\n${ran - failed} of ${ran} case(s) right.`);
process.exit(failed ? 1 : 0);
