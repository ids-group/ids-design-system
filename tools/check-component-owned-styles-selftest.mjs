#!/usr/bin/env node
// Does check-component-owned-styles still FIRE on a template borrowing a global class, on a global
// partial aiming at a component host and on a stylesheet holding `@layer`, and stay QUIET where the
// class is the component's own, waived, set only through a binding, or sits in a doc comment of
// consumer markup?
//
// Each case writes a miniature library into a private fixture tree under the OS temp dir and points
// the gate at it. Never into `src/`: this checkout is shared.
//
//   node tools/check-component-owned-styles-selftest.mjs
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TREE = join(tmpdir(), `owned-styles-selftest.${process.pid}`);

const BASE = {
  'styles/_typography.scss': '.t-s { font-size: 14px; }\n.sr-only { position: absolute; }',
  'styles/_link.scss': '.link { color: blue; &.quiet { color: gray; } }',
  'styles/_dropdown-overlay.scss': '.ds-dropdown-panel { .empty { padding: 4px; } }',
  'styles/_mixins.scss': '@mixin frame { .frame-empty { margin: 0; } }',
  'styles/_component-base.scss': '@mixin rules { :host { box-sizing: border-box; } }',
  'components/foo/foo.component.ts':
    "@Component({ selector: 'ds-foo', templateUrl: './foo.component.html' })\nexport class Foo {}",
  'components/foo/foo.component.scss':
    "@use '../../styles/component-base';\n@include component-base.rules;\n:host { display: block; }\n.label { color: red; }",
};

const run = (files) => {
  rmSync(TREE, { recursive: true, force: true });
  for (const [file, contents] of Object.entries({ ...BASE, ...files })) {
    mkdirSync(dirname(join(TREE, file)), { recursive: true });
    writeFileSync(join(TREE, file), contents);
  }
  try {
    execFileSync('node', ['tools/check-component-owned-styles.mjs'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, DS_OWNED_STYLES_LIB: TREE },
    });
    return { failed: false, output: '' };
  } catch (error) {
    return { failed: true, output: (error.stdout ?? '') + (error.stderr ?? '') };
  }
};

const html = (markup) => ({ 'components/foo/foo.component.html': markup });

// [name, files, mustFire, expected]
const cases = [
  [
    'the planted defect: a picker row borrowing the typography class',
    html('<li class="empty t-s">No matches</li>'),
    true,
    'class "t-s"',
  ],
  [
    'a global class bound with [class.x]',
    html('<span [class.sr-only]="hidden()">x</span>'),
    true,
    'class "sr-only"',
  ],
  [
    'a global class in an inline template',
    {
      'components/foo/foo.component.ts':
        "@Component({ selector: 'ds-foo', template: `<a class=\"link\">x</a>` })\nexport class Foo {}",
    },
    true,
    'class "link"',
  ],
  [
    'a global partial aiming at a component host',
    { 'styles/_shimmer.scss': '@media (prefers-reduced-motion: reduce) { ds-foo::after { animation: none; } }' },
    true,
    'ds-foo::after',
  ],
  [
    'a host inside a compound selector of a global partial',
    { 'styles/_zone.scss': '.zone > ds-foo.is-open { color: red; }' },
    true,
    'ds-foo',
  ],
  [
    'an own class beside a borrowed one still fires on the borrowed one',
    html('<span class="label t-s">x</span>'),
    true,
    'class "t-s"',
  ],
  [
    'a class the component defines itself passes, even when a partial defines it too',
    {
      ...html('<span class="link">x</span>'),
      'components/foo/foo.component.scss': "@use '../../styles/component-base';\n@include component-base.rules;\n.link { color: red; }",
    },
    false,
  ],
  [
    'a class the component gets through a mixin it includes is its own',
    {
      ...html('<p class="frame-empty">x</p>'),
      'components/foo/foo.component.scss':
        "@use '../../styles/component-base';\n@use '../../styles/mixins';\n@include component-base.rules;\n@include mixins.frame;",
    },
    false,
  ],
  [
    'a class only a link modifier names is not the link partial',
    html('<span class="quiet">x</span>'),
    false,
  ],
  [
    'the panel partial is global by necessity, so its classes are allowed',
    html('<li class="empty">No matches</li>'),
    false,
  ],
  [
    'a waived class with a reason passes',
    html('<!-- component-owned-styles: .t-s the consumer opted in -->\n<p class="t-s">x</p>'),
    false,
  ],
  [
    'consumer markup in a doc comment is not a template',
    {
      'components/foo/foo.component.ts':
        "/**\n * <button class=\"link\">Clear</button>\n */\n@Component({ selector: 'ds-foo', template: `<b>x</b>` })\nexport class Foo {}",
    },
    false,
  ],
  [
    'a keyframes name that starts like a host is not a selector',
    { 'styles/_motion.scss': '@keyframes ds-foo-in { from { opacity: 0; } }' },
    false,
  ],
  [
    'a component stylesheet without the component base',
    { 'components/foo/foo.component.scss': ':host { display: block; }' },
    true,
    'does not include `component-base.rules`',
  ],
  [
    'a component stylesheet that waives the base with a reason',
    {
      'components/foo/foo.component.scss':
        '/* component-owned-styles: base the host only toggles display */\n:host { display: none; }',
    },
    false,
  ],
  [
    'a component stylesheet holding a cascade layer',
    {
      'components/foo/foo.component.scss':
        "@use '../../styles/component-base';\n@include component-base.rules;\n@layer base { :host { display: block; } }",
    },
    true,
    'holds `@layer`',
  ],
  [
    'an inline component style holding a cascade layer',
    {
      'components/foo/foo.component.ts':
        "@Component({ selector: 'ds-foo', template: '', styles: [`@layer base { :host { display: block; } }`] })\nexport class Foo {}",
    },
    true,
    'holds `@layer`',
  ],
  [
    'a cascade layer named only in a comment',
    {
      'components/foo/foo.component.scss':
        "@use '../../styles/component-base';\n@include component-base.rules;\n// no @layer here\n:where(:host) { display: block; }",
    },
    false,
  ],
  ['NEGATIVE CONTROL - own classes only, must stay green', html('<span class="label">x</span>'), false],
];

let failures = 0;
for (const [name, files, mustFire, expected] of cases) {
  const { failed, output } = run(files);
  if (mustFire && !failed) {
    console.error(`FAIL  ${name}: the gate stayed green.`);
    failures += 1;
  } else if (!mustFire && failed) {
    console.error(`FAIL  ${name}: the gate went red.\n${output}`);
    failures += 1;
  } else if (mustFire && !output.includes(expected)) {
    console.error(`FAIL  ${name}: fired, but did not name ${expected}.\n${output}`);
    failures += 1;
  } else {
    console.log(`ok    ${name}`);
  }
}

rmSync(TREE, { recursive: true, force: true });

if (failures > 0) {
  console.error(`\ncheck-component-owned-styles-selftest: ${failures} case(s) failed.`);
  process.exit(1);
}
const firing = cases.filter(([, , mustFire]) => mustFire).length;
console.log(
  `\ncheck-component-owned-styles-selftest: OK - ${cases.length} cases, ${firing} firing shapes and ${cases.length - firing} sound ones.`,
);
