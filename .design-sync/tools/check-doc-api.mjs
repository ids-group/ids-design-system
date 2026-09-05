// Does every prop the agent-facing docs USE actually exist?
//
// `.design-sync/docs/<Name>.md` ships as `<Name>.prompt.md`, and its ```tsx block is the example an
// agent copies. A prop that was renamed or that never existed compiles nowhere and fails silently
// at runtime, so the example is the highest-leverage place for the docs to be wrong — and
// check-manual-surface only verifies that a doc EXISTS.
//
// Found this way: docs/Button.md presents `subtext` alongside `icon` and `trailingIcon` as though
// all three were inputs. Two are; the third is a projection slot. That reads as a distinction
// without a difference now that slots are declared props, which is exactly why the check compares
// against props AND slots rather than inputs alone.
//
//   node .design-sync/tools/check-doc-api.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const syncDir = resolve(here, '..');
const surface = JSON.parse(
  readFileSync(join(syncDir, 'elements/gen/surface.json'), 'utf8'),
);

const accepted = new Map();
for (const component of surface.components) {
  const names = new Set(['children', 'key', 'ref', 'className', 'style']);
  for (const entry of component.api) {
    if (entry.kind === 'output') {
      names.add(`on${entry.name[0].toUpperCase()}${entry.name.slice(1)}`);
      continue;
    }
    names.add(entry.name);
    if (entry.kind === 'model')
      names.add(`on${entry.name[0].toUpperCase()}${entry.name.slice(1)}Change`);
  }
  for (const slot of component.slots) names.add(slot.prop);
  accepted.set(component.name, names);
}

// An opening tag and everything up to its `>`; only `name=` counts as an attribute.
//
// Boolean shorthand is deliberately NOT checked, and the attempt is worth recording: accepting a
// bare word turned 16 findings into 484, nearly all of them prose — `<Alert at>`, `<Switch to>`.
// Any `>` inside the tag (an arrow body, a comparison in a string) ends the match early and leaves
// the following sentence looking like a run of attributes, and no guard on the tag text separated
// the two reliably. So a stale shorthand prop like `<Autocomplete open>` has to be found by hand.
// The trade is deliberate: this gate can fail to report, but it will not invent a prop.
const OPENING_TAG = /<([A-Z][A-Za-z0-9]*)([^<>]*)>/g;
const ATTRIBUTE = /(?:^|[\s{])([a-zA-Z][A-Za-z0-9]*)\s*=[^=]/g;

const problems = [];

function scan(label, source) {
  for (const [, component, attributes] of source.matchAll(OPENING_TAG)) {
    const names = accepted.get(component);
    // A tag naming something outside the library is the author's own illustration (a plain `<Foo>`
    // standing in for the consumer's component), and not this check's business.
    if (!names) continue;
    // The tag was cut at the `>` of an arrow, so what follows is a function body, not attributes.
    if (attributes.trimEnd().endsWith('=')) continue;
    for (const [, attribute] of attributes.matchAll(ATTRIBUTE)) {
      if (names.has(attribute)) continue;
      problems.push(
        `${label} — <${component} ${attribute}> is not a prop of ${component}`,
      );
    }
  }
}

// A controlled-prop claim in PROSE, which the tag scan above cannot see: seven docs promised
// `open` + `onOpenChange` on components that have neither, and an agent passing `open` gets a
// dropdown that never opens.
//
// Only `on…Change`, and only inside backticks. Wider shapes are noise - prose legitimately
// backticks value names, an item object's fields, and the name of a prop it says does NOT exist:
// every backticked identifier gives 46 findings on this tree, this one gives 0.
const HANDLER_CLAIM = /`(on[A-Z][A-Za-z0-9]*Change)`/g;

for (const file of readdirSync(join(syncDir, 'docs')).filter((name) =>
  name.endsWith('.md'),
)) {
  const name = file.replace(/\.md$/, '');
  const text = readFileSync(join(syncDir, 'docs', file), 'utf8').replace(
    /\r\n/g,
    '\n',
  );
  for (const [, fence] of text.matchAll(/```tsx\n([\s\S]*?)```/g))
    scan(`docs/${file}`, fence);

  const names = accepted.get(name);
  if (names) {
    const prose = text.replace(/```[\s\S]*?```/g, '');
    for (const [, handler] of prose.matchAll(HANDLER_CLAIM)) {
      if (names.has(handler)) continue;
      problems.push(
        `docs/${file} — prose offers \`${handler}\`, which ${name} does not have`,
      );
    }
  }
  if (!accepted.has(name)) {
    problems.push(
      `docs/${file} — no component named ${name}; the doc would upload with nothing to describe`,
    );
  }
}

if (problems.length) {
  console.error(
    `check-doc-api: ${problems.length} claim(s) the surface does not support:`,
  );
  for (const problem of [...new Set(problems)].sort())
    console.error(`  ${problem}`);
  console.error(
    "  The docs ship as the agent's instructions, so a wrong prop there is executed,",
  );
  console.error(
    '  not read. Fix the doc, or add the prop if the example is what the API should be.',
  );
  process.exit(1);
}

console.log(
  `check-doc-api: every prop used in ${accepted.size} doc(s) exists on the component it is used on.`,
);
