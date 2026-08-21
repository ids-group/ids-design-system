// tools/migration-lint.mjs
//
// Every migrations/<version>.json, checked against the contract in
// migrations/README.md. It exists because NOTHING validated these files: a
// manifest could ship malformed, or — the case that actually cost a consumer a
// day — well-formed and undetectable.
//
// mm-broker upgraded 0.6.0 -> 0.10.1 in one branch (2026-08-21) and the review
// after it found two items that the whole find/apply/recheck loop had passed
// over in silence:
//
//   0.7.1 table-sortkey-non-null-when-unsorted — `old` was `ds-table[sortKey]`
//   and every searchHint named the DS. The code that breaks is the HOST's:
//   `sorting: store.sortKey() ? { path: sortKey()!, order: sortDir() ?? 'Asc' }`
//   in a store file, which mentions no DS symbol at all. The finder reported
//   zero hits, the orchestrator recorded not-applicable, and the recheck's
//   clean grep CONFIRMED it. Three server-paged screens kept sorting by a
//   column whose header showed no sort.
//
//   0.7.1 field-reserve-message-default-off — the note said the now-redundant
//   `[reserveMessage]="false"` bindings could go, at word 150 of 200, with no
//   structured delete entry. Three of them survived the upgrade.
//
// So the rules below are about DETECTABILITY, not spelling: an item has to say
// WHERE a consumer's own code changes (`surface`), what that code LOOKS like
// when it is not a DS symbol (`detect`), what proves the migration landed
// (`verify`), what became redundant (`deleteList`), and which earlier item it
// reverses (`supersedes`).
//
// Usage:
//   node tools/migration-lint.mjs                 all manifests
//   node tools/migration-lint.mjs migrations/0.9.0.json …   specific files
//   node tools/migration-lint.mjs --strict        legacy warnings fail too
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATIONS = join(ROOT, 'migrations');

// Manifests authored before the contract grew `surface` / `verify` / `detect`.
// They are linted for schema, and their missing detectability fields are
// WARNINGS so the back-fill can land release by release (docs/todo.md tracks
// it). Everything newer — including unreleased.json — is held to the full
// contract, because a new release is where a miss is still cheap to prevent.
const LEGACY_THROUGH = '0.10.1';

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

const semver = (version) => version.split('.').map(Number);
const isNewer = (a, b) => {
  const [x, y, z] = semver(a);
  const [p, q, r] = semver(b);
  return x !== p ? x > p : y !== q ? y > q : z > r;
};

/** A hint that only ever appears in OUR sources cannot locate a consumer's own
 *  code — which is the whole failure this linter is named after. */
const isDsSymbol = (hint) =>
  /^--ds-|^--[a-z]/.test(hint) ||
  /^<?ds-[a-z-]+(\[[^\]]*\])?>?$/.test(hint) ||
  /^(Ds[A-Z]|[A-Z][A-Za-z]*(Component|Directive|Service|Config))/.test(hint) ||
  /^@ids-group-ltd\//.test(hint) ||
  /^@use ['"]@ids-group-ltd\//.test(hint);

const DEFAULT_CHANGE = /DEFAULT CHANGED|CHANGED DEFAULT|defaults? (?:\S+ )?(?:to|now|FALSE|TRUE)\b|now defaults/i;

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

const strict = process.argv.includes('--strict');
const errors = [];
const warnings = [];
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

  // A legacy manifest predates the detectability fields; it is still held to
  // every schema rule, and its gaps are reported as warnings.
  const legacy =
    !unreleased && typeof version === 'string' && !isNewer(version, LEGACY_THROUGH);
  const gap = legacy ? warnings : errors;

  const seen = new Set();
  for (const item of manifest.items ?? []) {
    const id = item.id ?? '<no id>';
    const at = (code, message, list = errors) => report(list, file, code, `${id}: ${message}`);

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
      at('M020', 'no `surface` — say where the consumer\'s code changes', gap);
    } else if (!surfaces.length || surfaces.some((one) => !SURFACES.has(one))) {
      at('M021', `unknown surface ${JSON.stringify(item.surface)}`);
    }

    if (BEHAVIOURAL.has(item.kind) && item.verify === undefined) {
      at(
        'M022',
        'no `verify` — a behavioural item has no old symbol to grep, so the recheck ' +
          'has nothing to prove it landed',
        gap,
      );
    }

    // The sortKey trap: the item is about the consumer's own code, and every
    // string that could find it names the DS instead.
    const locators = [...hints, ...detect, ...(item.old ? [item.old] : [])];
    if (
      BEHAVIOURAL.has(item.kind) &&
      surfaces.length &&
      surfaces.some((one) => one !== 'template' && one !== 'none') &&
      locators.length &&
      locators.every(isDsSymbol)
    ) {
      at(
        'M023',
        `every locator names the DS (${locators.slice(0, 3).join(', ')}) while surface is ` +
          `"${item.surface}" — add \`detect\` shapes written the way the CONSUMER writes them`,
        gap,
      );
    }

    if (DEFAULT_CHANGE.test(item.note ?? '') && item.restore === undefined) {
      at(
        'M024',
        'reads as a changed default with no `restore` — give the literal snippet, ' +
          'or state "restore": null when there is no way back',
        gap,
      );
    }

    // Both directions are declared, because both readers exist: a chain walker
    // needs to know an item was reversed later, and a consumer landing on the
    // later item needs to know what it undoes.
    for (const field of ['supersedes', 'supersededBy']) {
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
  }

  const prose = (manifest.informational ?? []).filter((line) =>
    /^DELETE-LIST/.test(String(line)),
  ).length;
  if (prose && !(manifest.deleteList ?? []).length) {
    report(
      gap,
      file,
      'M033',
      `${prose} DELETE-LIST line(s) live only in prose — mirror them into \`deleteList\``,
    );
  }
}

for (const line of errors) console.error(`migration-lint: ERROR  ${line}`);
for (const line of warnings) console.warn(`migration-lint: warn   ${line}`);

const legacyNote = warnings.length
  ? ` (${warnings.length} warning${warnings.length === 1 ? '' : 's'} on legacy manifests — see docs/todo.md)`
  : '';

if (errors.length || (strict && warnings.length)) {
  console.error(
    `migration-lint: FAILED — ${errors.length} error(s)${strict ? `, ${warnings.length} warning(s)` : legacyNote}`,
  );
  process.exit(1);
}

console.log(`migration-lint: ${targets.size} manifest(s) OK${legacyNote}`);
