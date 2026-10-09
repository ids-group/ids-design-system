#!/usr/bin/env node
// Does check-changelog-pending still FIRE on an undescribed public change, and stay QUIET once the
// change is named? Runs the check's pure halves on synthetic trees and a synthetic class-surface
// report, so no file of the checkout is read or written.
//
//   node tools/check-changelog-pending-selftest.mjs
import {
  exemptFromLog,
  judge,
  parseArguments,
  pendingChanges,
  unreleasedBlock,
} from './check-changelog-pending.mjs';

const BUTTON = 'src/lib/components/button/button.component.ts';
const STYLE = 'src/lib/components/button/button.component.scss';
const FACADE = 'src/lib/public-api.ts';

const tree = ({
  fallback = '4px',
  facade = 'ButtonComponent',
  extra = '',
} = {}) => [
  {
    path: BUTTON,
    text: `@Component({ selector: 'ds-button' })\nexport class ButtonComponent {}\nexport const internalHelper = 1;\n${extra}`,
  },
  {
    path: STYLE,
    text: `:host { padding: var(--ds-button-padding, ${fallback}); color: var(--ds-button-label-color, var(--ds-text-color)); }`,
  },
  { path: FACADE, text: `export { ${facade} } from './components/button';` },
];

const GAINED = `class-surface: comparing a..b

GAINED members — a subclass declaring the same name stops building:
  components/button/button.component.ts
    loading
`;
const GAINED_NEW_FILE = GAINED.replace(
  'button.component.ts',
  'button.component.ts  (new file)',
);

const EMPTY_BLOCK =
  '## Unreleased\n\n### Fixed\n\n## 0.1.0\n\n- old entry naming --ds-button-padding\n';
const block = (text) =>
  unreleasedBlock(`## Unreleased\n\n### Changed\n\n- ${text}\n\n## 0.1.0\n`);

// [name, before, after, class-surface report, exempt files, Unreleased block, unreleased.json, must fail, name that must be listed]
const cases = [
  [
    'no change at all',
    tree(),
    tree(),
    '',
    new Set(),
    unreleasedBlock(EMPTY_BLOCK),
    null,
    false,
  ],
  [
    'a hook default moved, Unreleased empty, no unreleased.json',
    tree(),
    tree({ fallback: '6px' }),
    '',
    new Set(),
    unreleasedBlock(EMPTY_BLOCK),
    null,
    true,
    '--ds-button-padding',
  ],
  [
    'the same move, named under Unreleased',
    tree(),
    tree({ fallback: '6px' }),
    '',
    new Set(),
    block('`--ds-button-padding` defaults to 6px.'),
    null,
    false,
  ],
  [
    'Unreleased has an entry that names something else',
    tree(),
    tree({ fallback: '6px' }),
    '',
    new Set(),
    block('`--ds-button-padding-inline` is new.'),
    null,
    true,
    '--ds-button-padding',
  ],
  [
    'named only in unreleased.json',
    tree(),
    tree({ fallback: '6px' }),
    '',
    new Set(),
    unreleasedBlock(EMPTY_BLOCK),
    '{"items":[{"old":"--ds-button-padding"}]}',
    false,
  ],
  [
    'a member gained, the element named',
    tree(),
    tree(),
    GAINED,
    new Set(),
    block('`ds-button` takes `loading`.'),
    null,
    false,
  ],
  [
    'a member gained, nothing named',
    tree(),
    tree(),
    GAINED,
    new Set(),
    block('A tooltip fix.'),
    null,
    true,
    'ButtonComponent',
  ],
  [
    'a member gained in a new file',
    tree(),
    tree(),
    GAINED_NEW_FILE,
    new Set(),
    unreleasedBlock(EMPTY_BLOCK),
    null,
    false,
  ],
  [
    'the file is exempted by Changelog: none',
    tree(),
    tree({ fallback: '6px' }),
    GAINED,
    exemptFromLog(
      '\u0001none\n\nsrc/lib/components/button/button.component.ts\nsrc/lib/components/button/button.component.scss\n',
    ),
    unreleasedBlock(EMPTY_BLOCK),
    null,
    false,
  ],
  [
    'an exempt commit and a plain one touch the same file',
    tree(),
    tree({ fallback: '6px' }),
    '',
    exemptFromLog(`\u0001none\n\n${STYLE}\n\u0001\n\n${STYLE}\n`),
    unreleasedBlock(EMPTY_BLOCK),
    null,
    true,
    '--ds-button-padding',
  ],
  [
    'an export the facade withholds',
    tree(),
    tree({ extra: 'export const anotherHelper = 2;' }),
    '',
    new Set(),
    unreleasedBlock(EMPTY_BLOCK),
    null,
    false,
  ],
  [
    'an export the facade publishes',
    tree(),
    tree({
      extra: 'export const ButtonSize = 2;',
      facade: 'ButtonComponent, ButtonSize',
    }),
    '',
    new Set(),
    unreleasedBlock(EMPTY_BLOCK),
    null,
    true,
    'ButtonSize',
  ],
  [
    'a hook inside another hook fallback is that hook default, not a read of its own',
    tree().map((file) =>
      file.path === STYLE
        ? { ...file, text: file.text.replace('var(--ds-text-color)', 'red') }
        : file,
    ),
    tree(),
    '',
    new Set(),
    block('`--ds-button-label-color` falls back to the text colour.'),
    null,
    false,
  ],
];

let failures = 0;
for (const [
  name,
  before,
  after,
  report,
  exempt,
  unreleased,
  manifest,
  mustFail,
  listed,
] of cases) {
  const result = judge(
    pendingChanges(before, after, report, exempt),
    unreleased,
    manifest,
  );
  const names = result.listed.flatMap((change) => change.names);
  const ok = result.failed === mustFail && (!listed || names.includes(listed));
  if (!ok) {
    failures++;
    console.error(
      `FAIL ${name}: expected ${mustFail ? `a failure listing ${listed}` : 'a pass'}, got "${result.verdict}" listing [${names.join(', ')}]`,
    );
  }
}

// [argv, must be rejected]: an unread option would fall back to the last tag and pass.
const argumentCases = [
  [['--bse', 'origin/dev'], true],
  [['--base'], true],
  [['--from', '--to', 'v0.1.0'], true],
  [['--base', 'origin/dev'], false],
  [['--from', 'v0.1.0', '--to', 'v0.2.0'], false],
  [['--audit'], false],
];
for (const [argv, mustReject] of argumentCases) {
  const rejected = Boolean(parseArguments(argv).error);
  if (rejected !== mustReject) {
    failures++;
    console.error(
      `FAIL arguments ${argv.join(' ')}: expected ${mustReject ? 'a rejection' : 'acceptance'}`,
    );
  }
}

if (failures) {
  console.error(
    `\nchangelog-pending selftest: ${failures} of ${cases.length + argumentCases.length} case(s) wrong.`,
  );
  process.exit(1);
}
console.log(
  `changelog-pending selftest: ${cases.length + argumentCases.length} case(s) hold.`,
);
