//
// Every migrations/<version>.json, checked against the contract in
// migrations/README.md. It exists because NOTHING validated these files: a
// manifest could ship malformed, or — the case that actually cost a consumer a
// day — well-formed and undetectable.
//
// Two shapes get through a find/apply/recheck loop in silence, and the rules below
// exist for them:
//
//   · the breaking code names no DS symbol at all — it is the HOST's expression
//     around a DS input — so DS-named search hints return zero hits and the clean
//     recheck grep CONFIRMS the false negative;
//   · an instruction to delete something now redundant, written as prose inside a
//     long note instead of a structured entry, is simply never executed.
//
// So the rules below are about DETECTABILITY, not spelling: an item has to say
// WHERE a consumer's own code changes (`surface`), what that code LOOKS like
// when it is not a DS symbol (`detect`), what proves the migration landed
// (`verify`), what became redundant (`deleteList`), and which earlier item it
// reverses (`supersedes`).
//
// There is no legacy tier: every published manifest meets this contract, so a gap is
// an error wherever it appears.
//
// Usage:
//   node tools/migration-lint.mjs                          all manifests
//   node tools/migration-lint.mjs migrations/0.9.0.json …   specific files
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATIONS = join(ROOT, 'migrations');

const KINDS = new Set([
  'selector-rename',
  'type-rename',
  'input-rename',
  'output-rename',
  'token-rename',
  'class-rename',
  'value-remap',
  'scss-api',
  'code-add',
  'removed-api',
  'behavior',
]);

// Where the consumer's own code changes. `none` is a deliberate statement that
// no consumer code moves (a pure default/visual change whose only action is to
// LOOK), not an absence — an item that forgets the field is a different thing
// from one that declares there is nothing to find.
const SURFACES = new Set(['template', 'typescript', 'style', 'config', 'none']);

const BEHAVIOURAL = new Set(['behavior', 'removed-api']);

// A value-remap changes what a binding MEANS with no symbol removed, so a re-check has nothing
// to grep either — it needs the same positive assertion a behavioural item does.
const NEEDS_VERIFY = new Set([...BEHAVIOURAL, 'value-remap']);

// A rename says everything in `old` -> `new`; the prose requirement applies to
// the kinds where the STEPS are the content.
const RENAMES = new Set([
  'selector-rename',
  'type-rename',
  'input-rename',
  'output-rename',
  'token-rename',
  'class-rename',
]);

/** A hint that only ever appears in OUR sources cannot locate a consumer's own
 *  code — which is the whole failure this linter is named after. */
const isDsSymbol = (hint) =>
  /^--ds-|^--[a-z]/.test(hint) ||
  /^<?ds-[a-z-]+(\[[^\]]*\])?>?$/.test(hint) ||
  /^(Ds[A-Z]|[A-Z][A-Za-z]*(Component|Directive|Service|Config))/.test(hint) ||
  /^@ids-group-ltd\//.test(hint) ||
  /^@use ['"]@ids-group-ltd\//.test(hint);

// A version cannot describe its own future; a later manifest carries the reversal.
const FORWARD_PROSE =
  /next release|later release|a later version|the release after|read the next|reversed later|in a future (release|version)/i;

const DEFAULT_CHANGE = /DEFAULT CHANGED|CHANGED DEFAULT|defaults? (?:\S+ )?(?:to|now|FALSE|TRUE)\b|now defaults|\bwas [^,.]{1,40}, now\b/i;

// A field's worth of structure typed into prose. Every one of these was in the notes 103 times
// before the split, which is what a missing field looks like from the outside.
const STRUCTURAL_MARKER =
  /\b(ACTION|NO ACTION|TRAP|GOTCHA|DECISION RULE|SCOPE|ALSO SCOPED HERE|INVERTED VALUE|CHANGED DEFAULT|CHANGED SEMANTICS|CHANGED MEANING|WHO IS AFFECTED|WHAT BREAKS|WHERE TO LOOK)\b/;

// Nothing outside these reads a key, so an unlisted one is a typo that fails silently.
const ITEM_KEYS = new Set([
  'id', 'kind', 'old', 'new', 'action', 'appliesWhen', 'pitfall', 'note',
  'surface', 'searchHints', 'detect', 'verify', 'restore', 'map', 'supersedes',
]);
const DELETE_KEYS = new Set(['id', 'surface', 'find', 'why', 'replaceWith']);
const TOP_KEYS = new Set(['version', 'items', 'informational', 'deleteList']);

const everyManifest = () =>
  readdirSync(MIGRATIONS)
    .filter((name) => name.endsWith('.json'))
    .map((name) => join(MIGRATIONS, name));

// Named files decide what is REPORTED, never what is loaded: a cross-version
// `supersedes` cannot be resolved against a single file, and a lint that fails
// because it was pointed at one manifest is a lint people stop running.
const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const targets = new Set(
  (requested.length ? requested.map((arg) => join(ROOT, arg)) : everyManifest()).map((path) =>
    basename(path).replace(/\.json$/, ''),
  ),
);

const errors = [];
const manifests = new Map();

const report = (list, file, code, message) =>
  list.push(`${basename(file)}  ${code}  ${message}`);

for (const file of everyManifest()) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    if (targets.has(basename(file).replace(/\.json$/, ''))) {
      report(errors, file, 'M001', `does not parse: ${error.message}`);
    }
    continue;
  }
  manifests.set(basename(file).replace(/\.json$/, ''), parsed);
}

for (const [name, manifest] of manifests) {
  if (!targets.has(name)) continue;
  const file = `${name}.json`;
  const unreleased = name === 'unreleased';
  const version = manifest.version;

  if (typeof version !== 'string') {
    report(errors, file, 'M002', 'no `version` string');
  } else if (!unreleased && version !== name) {
    report(errors, file, 'M003', `version "${version}" does not match the filename`);
  }

  if (!Array.isArray(manifest.items)) report(errors, file, 'M004', 'no `items` array');
  if (!Array.isArray(manifest.informational)) {
    report(errors, file, 'M005', 'no `informational` array (use [] when there is nothing)');
  }
  if (!Array.isArray(manifest.deleteList)) {
    report(errors, file, 'M037', 'no `deleteList` array (use [] when this release made nothing redundant) — an absent key reads as "nobody looked"');
  }
  for (const key of Object.keys(manifest)) {
    if (!TOP_KEYS.has(key)) report(errors, file, 'M042', `unknown top-level key \`${key}\``);
  }

  const seen = new Set();
  for (const item of manifest.items ?? []) {
    const id = item.id ?? '<no id>';
    const at = (code, message) => report(errors, file, code, `${id}: ${message}`);

    if (typeof item.id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.id)) {
      at('M010', 'id is not a stable kebab slug');
    }
    if (seen.has(item.id)) at('M011', 'duplicate id');
    seen.add(item.id);

    if (!KINDS.has(item.kind)) at('M012', `unknown kind "${item.kind}"`);
    if (!RENAMES.has(item.kind) && (typeof item.note !== 'string' || item.note.trim().length < 40)) {
      at('M013', 'note is missing or too short to act on');
    }
    if (RENAMES.has(item.kind) && !(item.old && item.new)) {
      at('M018', `${item.kind} needs both \`old\` and \`new\``);
    }

    if (item.kind === 'value-remap') {
      if (!item.map || typeof item.map !== 'object') at('M014', 'value-remap without a `map`');
    } else if (item.map) {
      at('M015', '`map` is only for value-remap');
    }

    // `removed-api` legitimately carries the replacement path it was named for;
    // a `behavior` item has no single replacement token, so prose is the only
    // honest place for it and `new` stays null.
    if (item.kind === 'behavior' && item.new !== null) {
      at('M016', 'behavior must carry "new": null — the steps belong in `note`');
    }

    const hints = Array.isArray(item.searchHints) ? item.searchHints : [];
    const detect = Array.isArray(item.detect) ? item.detect : [];
    if (!hints.length && !detect.length && item.kind !== 'behavior') {
      at('M017', 'no searchHints — nothing can locate this');
    }

    // --- detectability ------------------------------------------------------
    const surfaces = [item.surface ?? []].flat();
    if (item.surface === undefined) {
      at('M020', 'no `surface` — say where the consumer\'s code changes');
    } else if (!surfaces.length || surfaces.some((one) => !SURFACES.has(one))) {
      at('M021', `unknown surface ${JSON.stringify(item.surface)}`);
    }

    if (NEEDS_VERIFY.has(item.kind) && item.verify === undefined) {
      at(
        'M022',
        'no `verify` — a behavioural item has no old symbol to grep, so the recheck ' +
          'has nothing to prove it landed',
      );
    }

    // The sortKey trap: the item is about the consumer's own LOGIC, and every string that could
    // find it names the DS instead. `searchHints` is where OUR name appears; `detect` is what the
    // consumer's own expression looks like, and on these surfaces only the second can find the
    // break. One bare identifier among the hints used to be enough to silence this — which is
    // exactly the shape the rule is named after, so absence of `detect` is the error now.
    const locators = [...hints, ...detect, ...(item.old ? [item.old] : [])];
    if (
      BEHAVIOURAL.has(item.kind) &&
      surfaces.some((one) => one === 'typescript' || one === 'config') &&
      (!detect.length || (locators.length && locators.every(isDsSymbol)))
    ) {
      at(
        'M023',
        `surface is "${item.surface}" but nothing here is written the way the CONSUMER writes it — ` +
          'add `detect` shapes (their expression, their build error), not more of our own names',
      );
    }

    if (DEFAULT_CHANGE.test(item.note ?? '') && item.restore === undefined) {
      at(
        'M024',
        'reads as a changed default with no `restore` — give the literal snippet, ' +
          'or state "restore": null when there is no way back',
      );
    }

    // A manifest describes ONE step, and a version cannot know its own future:
    // an upgrade walks 0.9.0 -> 0.10.0 -> 0.10.1 one file at a time, and the
    // earlier file is frozen when the later one is written. So the link only
    // ever points BACK, from the item that reverses to the item it reverses.
    if (item.supersededBy !== undefined) {
      at(
        'M028',
        'supersededBy points at a future version, which the file cannot know — ' +
          'declare `supersedes` on the LATER item instead',
      );
    }
    if (FORWARD_PROSE.test(`${item.note ?? ''} ${item.restore ?? ''}`)) {
      at(
        'M029',
        'the note or restore refers to a later release — an upgrade applies this ' +
          'file on its own, so say what is true HERE and let the later manifest ' +
          'carry its own reversal',
      );
    }

    // `action` is the one field an applier executes, so it cannot be optional. `note` is the WHY
    // that survives once the instruction, the scope and the trap have their own homes.
    if (typeof item.action !== 'string' || item.action.trim().length < 10) {
      at('M039', 'no `action` — say the imperative on its own, separate from the reasoning in `note`');
    }
    if (STRUCTURAL_MARKER.test(item.note ?? '')) {
      at(
        'M040',
        'the note carries an ALL-CAPS structural marker, which means a field was not filled — ' +
          'the instruction belongs in `action`, the scope in `appliesWhen`, the trap in `pitfall`',
      );
    }
    const noteWords = String(item.note ?? '').split(/\s+/).filter(Boolean).length;
    if (noteWords > 120) {
      at('M041', `note is ${noteWords} words — over the 120-word ceiling; the instruction, the scope and the trap have their own fields`);
    }
    for (const key of Object.keys(item)) {
      if (!ITEM_KEYS.has(key)) at('M042', `unknown key \`${key}\` — nothing validates or reads it, so a typo here is silent`);
    }

    for (const field of ['supersedes']) {
      for (const reference of item[field] ?? []) {
        const [otherVersion, otherId] = String(reference).split('#');
        const other = manifests.get(otherVersion);
        if (!otherId || !otherVersion) {
          at('M025', `${field} "${reference}" is not <version>#<id>`);
        } else if (!other) {
          at('M026', `${field} "${reference}" — no manifest for ${otherVersion}`);
        } else if (!(other.items ?? []).some((candidate) => candidate.id === otherId)) {
          at('M027', `${field} "${reference}" — ${otherVersion} has no item "${otherId}"`);
        }
      }
    }
  }

  // --- delete list ----------------------------------------------------------
  // Prose delete-list entries are the older form and stay readable; the array
  // is what a tool can act on, which is why 24 of them in 0.10.0 were found by
  // a human reading all 63 informational strings and not by the loop.
  const seenDeleteIds = new Set();
  for (const entry of manifest.deleteList ?? []) {
    const id = entry.id ?? '<no id>';
    const finds = [entry.find ?? []].flat();
    if (!finds.length || finds.some((one) => typeof one !== 'string' || !one.trim())) {
      report(errors, file, 'M030', `${id}: delete entry needs \`find\` (a string or an array)`);
    }
    if (typeof entry.why !== 'string' || entry.why.trim().length < 20) {
      report(errors, file, 'M031', `${id}: delete entry without a \`why\``);
    }
    const entrySurfaces = [entry.surface ?? []].flat();
    if (entry.surface !== undefined && entrySurfaces.some((one) => !SURFACES.has(one))) {
      report(errors, file, 'M032', `${id}: unknown surface ${JSON.stringify(entry.surface)}`);
    }
    for (const key of Object.keys(entry)) {
      if (!DELETE_KEYS.has(key)) report(errors, file, 'M042', `${id}: unknown key \`${key}\` on a delete entry`);
    }
    if (typeof entry.replaceWith !== 'string' || !entry.replaceWith.trim()) {
      report(errors, file, 'M035', `${id}: delete entry without a \`replaceWith\` — say the API that replaces it, or the literal word "nothing"`);
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(entry.id ?? ''))) {
      report(errors, file, 'M036', `${id}: delete entry id is not a stable kebab slug — M034 citations resolve against it`);
    }
    if (seenDeleteIds.has(entry.id)) {
      report(errors, file, 'M036', `${id}: duplicate delete entry id`);
    }
    seenDeleteIds.add(entry.id);
  }

  // Second person plus one of these verbs is an instruction to delete consumer code, and prose
  // is not executed: 0.9.0 shipped five of them, four with no row to run. Requiring the sentence
  // to name its row is what makes the pair machine-checkable — a shape test alone passes as soon
  // as the file holds any unrelated `deleteList` entry.
  const DELETE_SHAPE =
    /\b(?:that (?:item|rule|override|copy)|those copies|the workaround|it) can go\b|\b(?:you|consumers?|apps?|callers?) (?:can|may) (?:now )?(?:delete|remove|drop|unset)\b|\byou no longer need\b|\bdelete that\b|\bremove it\b|\bcan now be removed\b|\bno longer needed\b/i;
  const DELETE_MARKER = /\(DELETE-LIST\)|DELETE-LIST MATERIAL|^DELETE-LIST/;
  const knownDeleteIds = new Set((manifest.deleteList ?? []).map((entry) => entry.id));
  const deleteProse = [
    ...(manifest.informational ?? []).map((line) => ['informational', line]),
    ...(manifest.items ?? []).flatMap((item) =>
      ['note', 'action', 'pitfall'].map((field) => [`item ${item.id} ${field}`, item[field] ?? '']),
    ),
  ];
  for (const [where, line] of deleteProse) {
    const sentences = String(line).split(/(?<=\.)\s+/);
    const guilty = sentences.find(
      (one) =>
        DELETE_MARKER.test(one) ||
        (DELETE_SHAPE.test(one) && /\b(?:you(?:r|rs)?|consumers?|apps?|callers?)\b/i.test(one)),
    );
    if (!guilty) continue;
    const cited = String(line).match(/\(delete list: ([a-z0-9-]+)\)/);
    if (!cited) {
      report(
        errors,
        file,
        'M034',
        where + ' tells the consumer to delete something but names no row — add a `deleteList` entry and cite it as "(delete list: <id>)": ' +
          JSON.stringify(guilty.trim().slice(0, 70)),
      );
    } else if (!knownDeleteIds.has(cited[1])) {
      report(errors, file, 'M034', where + ' cites "' + cited[1] + '", which is no `deleteList` id in this file');
    }
  }
}

for (const line of errors) console.error(`migration-lint: ERROR  ${line}`);

if (errors.length) {
  console.error(`migration-lint: FAILED — ${errors.length} error(s)`);
  process.exit(1);
}

console.log(`migration-lint: ${targets.size} manifest(s) OK`);
