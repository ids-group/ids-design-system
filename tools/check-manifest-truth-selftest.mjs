#!/usr/bin/env node
// Can the boundary check still FIRE, and do its exemptions still HOLD? Both halves earn their
// place: every exemption below exists because a real published item was wrongly accused by an
// earlier shape of the rule, so a regression in any of them puts that noise back.
//
// Nothing here writes to the repository — the checkout is shared with other sessions, so a test
// that mutates a real manifest can lose a race for the file. The rules run through the exported
// `checkItem` against synthetic surfaces; what depends on reading a tree is asserted by running
// the real check over one version, read-only.
//
//   node tools/check-manifest-truth-selftest.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkItem, surfaceAt } from './check-manifest-truth.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const surface = ({
  tokens = [],
  symbols = [],
  classes = [],
  elements = {},
  partials = [],
  keyframes = [],
  members = [],
  declared = [],
  directives = [],
  directiveMembers = {},
  classPrefixes = [],
}) => ({
  tokens: new Set(tokens),
  symbols: new Set(symbols),
  classes: new Set(classes),
  partials: new Set(partials),
  keyframes: new Set(keyframes),
  elements: new Map(
    Object.entries(elements).map(([tag, members]) => [tag, new Set(members)]),
  ),
  members: new Set(members),
  declared: new Set(declared),
  directives: new Set(directives),
  directiveMembers: new Map(
    Object.entries(directiveMembers).map(([name, inputs]) => [
      name,
      new Set(inputs),
    ]),
  ),
  classPrefixes: new Set(classPrefixes),
  quotedNames: new Set(),
  dataAttributes: new Set(),
  sassCallables: new Set(),
});

const rules = [
  {
    name: 'FIRES when a token family matches nothing at the earlier tag',
    item: {
      id: 'x',
      kind: 'token-rename',
      old: '--ds-*-bg',
      new: '--ds-*-bg-color',
    },
    before: surface({ tokens: ['--ds-card-fg'] }),
    after: surface({ tokens: ['--ds-card-bg-color'] }),
    expect: 'fire',
  },
  {
    name: 'HOLDS: a token family and a prefix that match',
    item: {
      id: 'x',
      kind: 'token-rename',
      old: '--ds-combobox-',
      new: '--ds-*-w | -h',
    },
    before: surface({ tokens: ['--ds-combobox-bg'] }),
    after: surface({ tokens: ['--ds-select-h', '--ds-select-w'] }),
    expect: 'hold',
  },
  {
    name: 'FIRES when a @use names a partial the tag does not ship',
    item: {
      id: 'x',
      kind: 'code-add',
      old: null,
      new: "@use '@ids-group-ltd/ids-design-system/styles/never' as n;\n@include n.vars;",
    },
    before: surface({ partials: ['styles/breakpoints'] }),
    after: surface({ partials: ['styles/breakpoints'] }),
    expect: 'fire',
  },
  {
    name: 'FIRES when a keyframe list names one the tag does not declare',
    item: {
      id: 'x',
      kind: 'behavior',
      old: 'modal-out / drawer-close-left|right',
      new: null,
    },
    before: surface({ keyframes: ['modal-out', 'drawer-close-left'] }),
    after: surface({ keyframes: [] }),
    expect: 'fire',
  },
  {
    name: 'FIRES when a compound class under a child combinator never existed',
    item: {
      id: 'x',
      kind: 'class-rename',
      old: 'ds-select .trigger.never > ds-tag',
      new: null,
    },
    before: surface({
      classes: ['trigger'],
      elements: { 'ds-select': [], 'ds-tag': [] },
    }),
    after: surface({
      classes: ['trigger'],
      elements: { 'ds-select': [], 'ds-tag': [] },
    }),
    expect: 'fire',
  },
  {
    name: 'HOLDS: an unknown called function is set aside, not accused',
    item: {
      id: 'x',
      kind: 'scss-api',
      old: 'avatarTnt(seed)',
      new: 'avatarTint(seed)',
    },
    before: surface({ symbols: ['avatarTint'] }),
    after: surface({ symbols: ['avatarTint'] }),
    expect: 'hold',
    unresolved: 1,
  },
  {
    name: 'HOLDS: a bare camelCase input name resolves against element members',
    item: { id: 'x', kind: 'behavior', old: 'pinOnClick', new: null },
    before: surface({ elements: { 'ds-line-series': ['pinOnClick'] } }),
    after: surface({ elements: { 'ds-line-series': ['pinOnClick'] } }),
    expect: 'hold',
    unresolved: 0,
  },
  {
    name: 'HOLDS: a bare camelCase directive selector resolves',
    item: { id: 'x', kind: 'behavior', old: 'dsChartTooltip', new: null },
    before: { ...surface({}), directives: new Set(['dsChartTooltip']) },
    after: { ...surface({}), directives: new Set(['dsChartTooltip']) },
    expect: 'hold',
    unresolved: 0,
  },
  {
    name: 'HOLDS: a bare camelCase name no element declares is set aside',
    item: { id: 'x', kind: 'behavior', old: 'pinOnClik', new: null },
    before: surface({ elements: { 'ds-line-series': ['pinOnClick'] } }),
    after: surface({ elements: { 'ds-line-series': ['pinOnClick'] } }),
    expect: 'hold',
    unresolved: 1,
  },
  {
    name: 'FIRES when a note names a --ds-* token neither tag declares',
    item: {
      id: 'x',
      kind: 'removed-api',
      old: '--chart-tick',
      new: null,
      note: 'It fed `--ds-chart-never-shipped`, which reached no rule.',
    },
    before: surface({ tokens: ['--chart-tick'] }),
    after: surface({ tokens: [] }),
    expect: 'fire',
  },
  {
    name: 'FIRES when an element-scoped class never existed',
    item: {
      id: 'x',
      kind: 'class-rename',
      old: 'ds-modal .no-such',
      new: null,
    },
    before: surface({ classes: ['danger'], elements: { 'ds-modal': [] } }),
    after: surface({ classes: ['error'], elements: { 'ds-modal': [] } }),
    expect: 'fire',
  },
  {
    name: 'HOLDS: an element-scoped class that existed, under a scope renamed in the same release',
    item: { id: 'x', kind: 'class-rename', old: 'ds-pie .donut', new: null },
    before: surface({ classes: ['donut'], elements: { 'ds-donut': [] } }),
    after: surface({ classes: ['pie'], elements: { 'ds-pie': [] } }),
    expect: 'hold',
  },
  {
    name: 'FIRES when a renamed injection token never existed',
    item: {
      id: 'x',
      kind: 'type-rename',
      old: 'DS_NEVER_WAS',
      new: 'DS_TOAST_CONFIG',
    },
    before: surface({ symbols: ['DS_TOAST_CONFIG'] }),
    after: surface({ symbols: ['DS_TOAST_CONFIG'] }),
    expect: 'fire',
  },
  {
    name: 'FIRES when an opening tag names an element that never existed',
    item: { id: 'x', kind: 'behavior', old: '<ds-never>', new: null },
    before: surface({ elements: { 'ds-toast': [] } }),
    after: surface({ elements: { 'ds-toast': [] } }),
    expect: 'fire',
  },
  {
    name: 'FIRES when old never existed and new names nothing either',
    item: {
      id: 'x',
      kind: 'token-rename',
      old: '--never-was',
      new: '--also-never',
    },
    before: surface({ tokens: ['--real'] }),
    after: surface({ tokens: ['--real'] }),
    expect: 'fire',
  },
  {
    name: 'FIRES when a renamed token still resolves at its own tag',
    item: {
      id: 'x',
      kind: 'token-rename',
      old: '--primary',
      new: '--primary-strong',
    },
    before: surface({ tokens: ['--primary'] }),
    after: surface({ tokens: ['--primary', '--primary-strong'] }),
    expect: 'fire',
  },
  {
    name: 'FIRES when new does not exist at the tag',
    item: {
      id: 'x',
      kind: 'token-rename',
      old: '--primary',
      new: '--never-shipped',
    },
    before: surface({ tokens: ['--primary'] }),
    after: surface({ tokens: [] }),
    expect: 'fire',
  },
  {
    name: 'HOLDS: a phantom rename whose new name IS real',
    item: {
      id: 'x',
      kind: 'output-rename',
      old: 'ds-banner[dismissed]',
      new: 'closed',
    },
    before: surface({ elements: { 'ds-banner': ['closed'] } }),
    after: surface({ elements: { 'ds-banner': ['closed'] } }),
    expect: 'hold',
  },
  {
    name: 'FIRES on `X` -> `X<T>` filed as a rename: the bare name survives, so it is not one',
    item: {
      id: 'x',
      kind: 'type-rename',
      old: 'ToastPromiseMessages',
      new: 'ToastPromiseMessages<T>',
    },
    before: surface({ symbols: ['ToastPromiseMessages'] }),
    after: surface({ symbols: ['ToastPromiseMessages'] }),
    expect: 'fire',
  },
  {
    name: 'HOLDS: a suffix rename still has to lose the old token',
    item: {
      id: 'x',
      kind: 'token-rename',
      old: '--ds-toast-border',
      new: '--ds-toast-border-color',
    },
    before: surface({ tokens: ['--ds-toast-border'] }),
    after: surface({ tokens: ['--ds-toast-border-color'] }),
    expect: 'hold',
  },
  {
    name: 'HOLDS: a consumer example class is set aside, not accused',
    item: {
      id: 'x',
      kind: 'behavior',
      old: 'class MyTable extends TableComponent',
      new: null,
    },
    before: surface({ symbols: ['TableComponent'] }),
    after: surface({ symbols: ['TableComponent'] }),
    expect: 'hold',
    unresolved: 1,
  },
  {
    // A bare custom element reached none of the branches and passed unread, along with 127 other
    // values. It resolves against the element map like any other name.
    name: 'FIRES when a removed element still answers at its own tag',
    item: {
      id: 'x',
      kind: 'selector-rename',
      old: 'ds-old-sheet',
      new: 'ds-sheet',
    },
    before: surface({ elements: { 'ds-old-sheet': [] } }),
    after: surface({ elements: { 'ds-old-sheet': [], 'ds-sheet': [] } }),
    expect: 'fire',
  },
  {
    name: 'HOLDS: an element that really went away',
    item: {
      id: 'x',
      kind: 'selector-rename',
      old: 'ds-old-sheet',
      new: 'ds-sheet',
    },
    before: surface({ elements: { 'ds-old-sheet': [] } }),
    after: surface({ elements: { 'ds-sheet': [] } }),
    expect: 'hold',
  },
  {
    // `ds-button[variant=outline]` names the same input as `ds-button[variant]`; before the value
    // form was read, an item written this way asserted nothing.
    name: 'FIRES on an attribute selector carrying a value, like the bare form',
    item: {
      id: 'x',
      kind: 'input-rename',
      old: 'ds-button[variant=outline]',
      new: 'appearance',
    },
    before: surface({ elements: { 'ds-button': ['variant'] } }),
    after: surface({ elements: { 'ds-button': ['variant', 'appearance'] } }),
    expect: 'fire',
  },
  {
    // A field's `error`, `hint` and `touched` are declared on a base class in another file, and
    // reading only the file that holds the `selector:` lost 139 real bindings across 16 elements.
    // `ds-input[reserveMessage]` and `ds-input[error]` are both verbatim published item shapes;
    // each passes at its OWN boundary, where the input was still declared in the component file,
    // and each would be accused the moment the same shape were written for a boundary after the
    // inputs moved up to the base — which is every boundary from now on.
    name: 'HOLDS: a member inherited from a base class is not accused',
    item: {
      id: 'x',
      kind: 'behavior',
      old: 'ds-input[reserveMessage]',
      new: null,
    },
    before: surface({ elements: { 'ds-input': ['reserveMessage'] } }),
    after: surface({ elements: { 'ds-input': ['reserveMessage'] } }),
    expect: 'hold',
  },
  {
    name: 'FIRES on a member no ancestor declares',
    item: {
      id: 'x',
      kind: 'behavior',
      old: 'ds-input[neverWasAnInput]',
      new: null,
    },
    before: surface({ elements: { 'ds-input': ['reserveMessage'] } }),
    after: surface({ elements: { 'ds-input': ['reserveMessage'] } }),
    expect: 'fire',
  },
  {
    // `removed-api` and `class-rename` were the two kinds in GONE_AFTER that no case touched:
    // deleting either from the set left this selftest green while 26 published items stopped
    // being asked to prove the change happened.
    name: 'FIRES when a removed API still resolves at its own tag',
    item: { id: 'x', kind: 'removed-api', old: 'LegacyService', new: null },
    before: surface({ symbols: ['LegacyService'] }),
    after: surface({ symbols: ['LegacyService'] }),
    expect: 'fire',
  },
  {
    name: 'HOLDS: a removed API that really went',
    item: { id: 'x', kind: 'removed-api', old: 'LegacyService', new: null },
    before: surface({ symbols: ['LegacyService'] }),
    after: surface({ symbols: [] }),
    expect: 'hold',
  },
  {
    name: 'FIRES when a renamed CSS class still resolves at its own tag',
    item: {
      id: 'x',
      kind: 'class-rename',
      old: '.crumb-sep',
      new: '.crumb-divider',
    },
    before: surface({ classes: ['crumb-sep'] }),
    after: surface({ classes: ['crumb-sep', 'crumb-divider'] }),
    expect: 'fire',
  },
  {
    // The exemption below is for a template binding only. Forgiving a phantom TOKEN because its
    // replacement is real left the rarer half of the failure as the only half caught, across 48
    // of 99 published rename items.
    name: 'FIRES on a token that never existed, even when `new` is real',
    item: { id: 'x', kind: 'token-rename', old: '--never-was', new: '--real' },
    before: surface({ tokens: ['--real'] }),
    after: surface({ tokens: ['--real'] }),
    expect: 'fire',
  },
  {
    name: 'FIRES on an element that never existed, even when `new` is real',
    item: {
      id: 'x',
      kind: 'selector-rename',
      old: 'ds-never-was',
      new: 'ds-real',
    },
    before: surface({ elements: { 'ds-real': [] } }),
    after: surface({ elements: { 'ds-real': [] } }),
    expect: 'fire',
  },
  {
    // The exemption itself, and why it exists: a binding against an output that was never
    // declared compiles and silently does nothing, so consumers really did write these. Four
    // published 0.11.3 items are exactly this and must stay green.
    name: 'HOLDS: a phantom template binding whose replacement is real',
    item: {
      id: 'x',
      kind: 'output-rename',
      old: 'ds-banner[dismissed]',
      new: 'closed',
    },
    before: surface({ elements: { 'ds-banner': [] } }),
    after: surface({ elements: { 'ds-banner': ['closed'] } }),
    expect: 'hold',
  },
  {
    // Without the `ds-` prefix every hyphenated value is looked up among elements, found missing,
    // and accused of migrating from nowhere — a density value, an aria attribute, an input alias.
    name: 'HOLDS: a hyphenated value that is not an element is not accused',
    item: { id: 'x', kind: 'behavior', old: 'ultra-compact', new: null },
    before: surface({ elements: { 'ds-button': [] } }),
    after: surface({ elements: { 'ds-button': [] } }),
    expect: 'hold',
  },
  {
    name: 'FIRES on an element neither tag ever declared',
    item: { id: 'x', kind: 'behavior', old: 'ds-never-was', new: null },
    before: surface({ elements: { 'ds-button': [] } }),
    after: surface({ elements: { 'ds-button': [] } }),
    expect: 'fire',
  },
  {
    // An attribute directive is written on someone else's element, so a `new` naming one is not a
    // member of that element and the surface has to know it separately. Three published items
    // moved a feature behind a directive and every one was accused of naming a member that does
    // not exist, which held the release gate red.
    name: 'HOLDS: a `new` that names an attribute directive on the element',
    item: {
      id: 'x',
      kind: 'input-rename',
      old: 'ds-table[exportButton]',
      new: 'dsTableExport',
    },
    before: surface({ elements: { 'ds-table': ['exportButton'] } }),
    after: {
      ...surface({ elements: { 'ds-table': [] } }),
      directives: new Set(['dsTableExport']),
    },
    expect: 'hold',
  },
  {
    name: 'FIRES on a `new` naming a directive nothing declares',
    item: {
      id: 'x',
      kind: 'input-rename',
      old: 'ds-table[exportButton]',
      new: 'dsTableNeverWas',
    },
    before: surface({ elements: { 'ds-table': ['exportButton'] } }),
    after: {
      ...surface({ elements: { 'ds-table': [] } }),
      directives: new Set(['dsTableExport']),
    },
    expect: 'fire',
  },
  {
    // The component writes `data-*` itself, so it is not an input and must not be looked up as one.
    name: 'HOLDS: a data-* attribute is not treated as a missing input',
    item: {
      id: 'x',
      kind: 'behavior',
      old: "ds-color-picker[data-field-state='error']",
      new: null,
    },
    before: surface({ elements: { 'ds-color-picker': [] } }),
    after: surface({ elements: { 'ds-color-picker': [] } }),
    expect: 'hold',
  },
  // The prose-name rule: every backticked name, in every prose field including `verify` and
  // `restore`, is looked up at both tags. It reports through `findings`, which fail only the
  // draft, so its verdict is read there and not from `defects`.
  {
    name: 'FINDS a backticked symbol in `verify` that neither tag declares',
    item: {
      id: 'x',
      kind: 'behavior',
      old: 'ds-table[sortKey]',
      new: null,
      verify: 'Every subclass of `TableComponent` reads `NeverDeclared` back.',
    },
    before: surface({
      elements: { 'ds-table': ['sortKey'] },
      symbols: ['TableComponent'],
    }),
    after: surface({
      elements: { 'ds-table': ['sortKey'] },
      symbols: ['TableComponent'],
    }),
    expect: 'hold',
    findings: 1,
  },
  {
    // A subclass collides with a protected member as surely as with an input, so a manifest
    // naming one is naming something real.
    name: 'HOLDS: a camelCase name that is a protected class member at one tag',
    item: {
      id: 'x',
      kind: 'behavior',
      old: 'ds-table[sortKey]',
      new: null,
      note: 'A subclass that declares `rowTrackBy` collides with ours.',
    },
    before: surface({ elements: { 'ds-table': ['sortKey'] } }),
    after: surface({
      elements: { 'ds-table': ['sortKey'] },
      members: ['rowTrackBy'],
    }),
    expect: 'hold',
    findings: 0,
  },
  {
    name: 'FINDS a global token of another prefix that neither tag declares',
    item: {
      id: 'x',
      kind: 'behavior',
      old: 'ds-table[sortKey]',
      new: null,
      restore: 'Set `--chart-never-gap` back to 4px.',
    },
    before: surface({
      elements: { 'ds-table': ['sortKey'] },
      tokens: ['--chart-bar-gap'],
    }),
    after: surface({
      elements: { 'ds-table': ['sortKey'] },
      tokens: ['--chart-bar-gap'],
    }),
    expect: 'hold',
    findings: 1,
  },
  {
    name: 'HOLDS: framework names in prose are not looked up',
    item: {
      id: 'x',
      kind: 'behavior',
      old: 'ds-table[sortKey]',
      new: null,
      pitfall:
        'An `InputSignal` override in a `ControlValueAccessor` fails under `strictTemplates`.',
    },
    before: surface({ elements: { 'ds-table': ['sortKey'] } }),
    after: surface({ elements: { 'ds-table': ['sortKey'] } }),
    expect: 'hold',
    findings: 0,
  },
  // The unread-value rule: why a value went unread decides whether an allowlist may answer.
  {
    name: 'UNREAD: a pseudo-class holds no name, so only an allowlist can answer for it',
    item: { id: 'x', kind: 'behavior', old: ':focus-visible', new: null },
    before: surface({}),
    after: surface({}),
    expect: 'hold',
    unread: 'unreadable',
  },
  {
    name: 'UNREAD: an element that exists only at the later tag is a claim, not a gap',
    item: { id: 'x', kind: 'behavior', old: 'ds-bar[semantics]', new: null },
    before: surface({ elements: { 'ds-meter': [] } }),
    after: surface({ elements: { 'ds-bar': ['semantics'] } }),
    expect: 'hold',
    unread: 'wrong-tag',
  },
  {
    name: 'READS an interface member written as `key: value`',
    item: { id: 'x', kind: 'behavior', old: null, new: 'durationMs: 5000' },
    before: surface({ members: ['durationMs'] }),
    after: surface({ members: ['durationMs'] }),
    expect: 'hold',
    unread: '',
  },
  {
    name: 'READS an input of an attribute directive, `dsLineSeries[highlighted]`',
    item: {
      id: 'x',
      kind: 'behavior',
      old: 'dsLineSeries[highlighted]',
      new: null,
    },
    before: surface({ directiveMembers: { dsLineSeries: ['highlighted'] } }),
    after: surface({ directiveMembers: { dsLineSeries: ['highlighted'] } }),
    expect: 'hold',
    unread: '',
  },
  {
    name: 'FINDS a class family that matches nothing, while an interpolated one is read',
    item: {
      id: 'x',
      kind: 'class-rename',
      old: 'ds-button .c-*',
      new: '.never-*',
    },
    before: surface({
      elements: { 'ds-button': [] },
      classPrefixes: ['c-'],
    }),
    after: surface({
      elements: { 'ds-button': [] },
      classes: ['color-primary'],
    }),
    expect: 'hold',
    findings: 1,
    unread: '',
  },
];

let failed = 0;
let ran = 0;
for (const testCase of rules) {
  const verdict = checkItem(
    testCase.item,
    testCase.before,
    testCase.after,
    'v0.0.0',
    'v0.0.1',
  );
  const got = verdict.defects.length ? 'fire' : 'hold';
  ran++;
  let ok = got === testCase.expect;
  if (
    testCase.unresolved !== undefined &&
    verdict.unresolved.length !== testCase.unresolved
  )
    ok = false;
  if (
    testCase.findings !== undefined &&
    verdict.findings.length !== testCase.findings
  )
    ok = false;
  const unread = verdict.unread.map((value) => value.reason).join(',');
  if (testCase.unread !== undefined && unread !== testCase.unread) ok = false;
  if (!ok) failed++;
  console.log(
    `${ok ? 'ok   ' : 'FAIL '} ${testCase.name} — expected ${testCase.expect}, got ${got}` +
      (testCase.unresolved !== undefined
        ? ` (${verdict.unresolved.length} set aside)`
        : '') +
      (testCase.findings !== undefined
        ? ` (${verdict.findings.length} finding(s))`
        : '') +
      (testCase.unread !== undefined ? ` (unread: ${unread || 'none'})` : ''),
  );
}

// These depend on reading a real tree, not on the rules alone: an implicit `model()` output that no
// source line declares, and the live shapes above as they actually ship.
// The third number is how many of that manifest's values hold no name to look up. A green exit
// alone proved nothing: replacing every value in a manifest with an unresolvable placeholder still
// exits 0, because a value nobody can read is not a defect. The budget is what notices.
const readOnly = [
  ['0.7.0', "a model()'s implicit Change output", 2],
  ['0.11.2', 'a consumer example in a detect shape', 1],
  ['0.11.3', 'four phantom output renames', 1],
  ['0.11.4', 'a widened type, filed as behavior rather than as a rename', 8],
];
const run = (version, options = {}) => {
  const spawn = () =>
    execFileSync(
      'node',
      ['tools/check-manifest-truth.mjs', ...(version ? [version] : [])],
      {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: 'pipe',
        env: { ...process.env, ...(options.env ?? {}) },
      },
    );
  try {
    const out = spawn();
    return options.text ? out : 'green';
  } catch (error) {
    const out = (error.stdout ?? '') + (error.stderr ?? '');
    return options.text ? out : 'red';
  }
};

for (const [version, what, budget] of readOnly) {
  const out = run(version, { text: true });
  ran++;
  const unchecked = Number(
    /(\d+) value\(s\) hold no single name/.exec(out)?.[1] ?? 0,
  );
  const ok =
    !/does not exist|still resolves|target is not there/.test(out) &&
    unchecked <= budget;
  if (!ok) failed++;
  console.log(
    `${ok ? 'ok   ' : 'FAIL '} ${version} as it ships — ${what}: no defect, and ${unchecked} ` +
      `value(s) unreadable against a budget of ${budget}`,
  );
}

// The inheritance walk lives in `surfaceAt`, not in the rules, so a synthetic surface cannot
// exercise it: these members are declared on a base class in a different file from the
// `selector:` that names the element.
{
  const inherited = [
    ['ds-input', 'reserveMessage'],
    ['ds-checkbox', 'touched'],
    ['ds-textarea', 'hint'],
    ['ds-modal', 'staticPreview'],
  ];
  const members = (tag_) => surfaceAt('v0.12.0')?.elements.get(tag_);
  for (const [tag_, member] of inherited) {
    ran++;
    const ok = Boolean(members(tag_)?.has(member));
    if (!ok) failed++;
    console.log(
      `${ok ? 'ok   ' : 'FAIL '} v0.12.0 ${tag_}[${member}] is reachable through its base class`,
    );
  }
  ran++;
  const tagQualified = Boolean(
    surfaceAt('v0.14.0')?.directives.has('dsLineSeries'),
  );
  if (!tagQualified) failed++;
  console.log(
    `${tagQualified ? 'ok   ' : 'FAIL '} v0.14.0 g[dsLineSeries] is read as a directive selector`,
  );
  ran++;
  // The set has to EXIST for its not-containing something to mean anything: `!undefined` is
  // true, so an empty surface used to pass this control while proving nothing.
  const present = members('ds-input');
  const clean = Boolean(present?.size) && !present.has('neverWasAnInput');
  if (!clean) failed++;
  console.log(
    `${clean ? 'ok   ' : 'FAIL '} v0.12.0 ds-input[neverWasAnInput] is not invented by the walk`,
  );
}

// A caller sees only the exit code, so a version the check could not look at has to fail.
const UNCHECKABLE = [
  ['9.9.9', 'no manifest of that name'],
  ['0.1.0', 'the earliest tag, so no predecessor to diff against'],
];
for (const [version, what] of UNCHECKABLE) {
  const got = run(version);
  ran++;
  const ok = got === 'red';
  if (!ok) failed++;
  console.log(
    `${ok ? 'ok   ' : 'FAIL '} ${version} is uncheckable — ${what}: expected red, got ${got}`,
  );
}

// The draft manifest is the ONE that can still be corrected, and it was excluded from the sweep by
// a filter that demanded an existing tag. Its boundary is the last tag against the working tree.
{
  ran++;
  // The draft is the one manifest that can still be corrected, and it used to be excluded from the
  // sweep by a filter that demanded an existing tag.
  // Straight after a release there is no draft, so the case brings an empty one of its own.
  const draftPath = join(ROOT, 'migrations', 'unreleased.json');
  const ownDraft = !existsSync(draftPath);
  if (ownDraft)
    writeFileSync(
      draftPath,
      JSON.stringify({
        version: 'unreleased',
        items: [],
        informational: [],
        deleteList: [],
      }),
    );
  let out;
  try {
    out = run('unreleased', { text: true });
  } finally {
    if (ownDraft) rmSync(draftPath);
  }
  const covered = /1 manifest\(s\) against/.test(out);
  if (!covered) failed++;
  console.log(
    `${covered ? 'ok   ' : 'FAIL '} migrations/unreleased.json is checkable, against the last tag`,
  );
}

// Two assertions the earlier cases could not make, because both branches they guard print nothing
// a caller can see from the exit code alone.
{
  ran++;
  const named = run('9.9.9', { text: true }).includes(
    'no migrations/9.9.9.json',
  );
  if (!named) failed++;
  console.log(
    `${named ? 'ok   ' : 'FAIL '} an unknown version says WHICH manifest is missing, not just "nothing checkable"`,
  );

  ran++;
  const unreadableFirst = (() => {
    const out = run('', { text: true, env: { DS_TRUTH_TAGS: 'v0.0.0' } });
    const warning = out.indexOf('could not be read at their own boundary');
    return warning !== -1;
  })();
  if (!unreadableFirst) failed++;
  console.log(
    `${unreadableFirst ? 'ok   ' : 'FAIL '} an unreadable boundary is announced even when there are defects to print`,
  );
}

// The new rule classes fail the draft and only report a published manifest. Each case runs the
// real sweep over a scratch migrations folder, so nothing in the checkout is written; the output
// has to name the phantom too, or a red for any other reason would pass.
{
  const scratch = mkdtempSync(join(tmpdir(), 'manifest-truth-'));
  const sweepOver = (version, verify, args = []) => {
    const file = join(scratch, `${version}.json`);
    writeFileSync(
      file,
      JSON.stringify({
        version,
        items: [
          {
            id: 'prose-names-a-name',
            kind: 'behavior',
            old: 'ds-button[variant]',
            new: null,
            verify,
          },
        ],
        informational: [],
        deleteList: [],
      }),
    );
    try {
      const output = execFileSync(
        'node',
        ['tools/check-manifest-truth.mjs', version, ...args],
        {
          cwd: ROOT,
          encoding: 'utf8',
          stdio: 'pipe',
          env: { ...process.env, DS_TRUTH_MIGRATIONS: scratch },
        },
      );
      return { status: 'green', output };
    } catch (error) {
      return {
        status: 'red',
        output: (error.stdout ?? '') + (error.stderr ?? ''),
      };
    } finally {
      rmSync(file);
    }
  };
  const phantom = '`NeverDeclaredAnywhere` is gone.';
  const real = '`ds-button[variant]` is bound.';
  try {
    for (const [what, run, expected, mustSay] of [
      [
        'a draft naming a phantom in prose',
        sweepOver('unreleased', phantom),
        'red',
        'NeverDeclaredAnywhere',
      ],
      [
        'a draft naming only real names',
        sweepOver('unreleased', real),
        'green',
        '',
      ],
      [
        'a published manifest naming a phantom',
        sweepOver('0.14.8', phantom),
        'green',
        '1 hit(s)',
      ],
      [
        'the same under --audit',
        sweepOver('0.14.8', phantom, ['--audit']),
        'green',
        'NeverDeclaredAnywhere',
      ],
    ]) {
      ran++;
      const ok = run.status === expected && run.output.includes(mustSay);
      if (!ok) failed++;
      console.log(
        `${ok ? 'ok   ' : 'FAIL '} ${what}: expected ${expected}${mustSay ? ` naming ${mustSay}` : ''}, got ${run.status}`,
      );
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

// Counted from what actually ran, never off the arrays: two of the assertions below live outside
// them, and an array-derived tally can never disagree with itself — it is decoration, not a check.
const fires =
  rules.filter(
    (rule) =>
      rule.expect === 'fire' || rule.findings > 0 || Boolean(rule.unread),
  ).length +
  UNCHECKABLE.length +
  1;
if (failed) {
  console.error(`\n${failed} case(s) wrong.`);
  process.exit(1);
}
console.log(
  `\nevery case behaved: ${ran} check(s) ran, ${fires} of them expected red`,
);
