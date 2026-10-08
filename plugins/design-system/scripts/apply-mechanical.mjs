#!/usr/bin/env node
// Applies the mechanical items of design-system migration manifests to a consumer source tree
// before any agent runs: token-, selector-, input-, output-, class- and type-renames, and
// value-remaps through their `map`. Every rewrite is an exact, boundary-safe replacement scoped the
// way the item's `old` says; an occurrence it sees and cannot rewrite safely is reported for the
// agents, never guessed. It never reads `action`, so an item whose `action` asks for more than the
// swap still needs an agent for the rest.
//
//   node apply-mechanical.mjs <source-root> <migrations/V.json>... [--dry-run]
//
// Manifests apply in the order given, each against the tree the previous one left. Within a
// version, attribute items run first, on the element `old` names, so a selector rename in the same
// release cannot move the tag out from under them; class renames run after selector renames for
// the same reason. Output (stdout, JSON):
//   { dryRun, root, items: [{ version, id, kind, status, reason?, files: { path: count },
//     edits: [{ loc, before, after }], left: [{ loc, match, el, dynamic?, reason }] }] }
// status: applied (rewrote, left nothing) | partial (rewrote and left some) | left (rewrote
// nothing, left some) | untouched (saw nothing). An item whose `old`/`new` this script cannot
// apply as an exact, scoped swap of one name for another is refused before any rewrite: `reason`
// says why, and every occurrence of `old` is reported as left. `left` is the finder's hit shape, ready for an applier.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const SKIP_DIRECTORIES = new Set(['node_modules', 'dist', '.angular', '.git']);
const EXTENSIONS = new Set(['.html', '.ts', '.scss', '.css']);
const STYLE = new Set(['.scss', '.css']);
const PACKAGE = '@ids-group-ltd/ids-design-system';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const lineAt = (text, offset) => text.slice(0, offset).split('\n').length;
const ELEMENT = /^[a-z][a-z0-9]*-[a-z0-9-]+$/;
const SCOPED_ATTRIBUTE = /^([a-z][a-z0-9]*-[a-z0-9-]+)\[([A-Za-z][\w.-]*)\]$/;
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

function* walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (SKIP_DIRECTORIES.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (EXTENSIONS.has(extname(entry.name))) yield path;
  }
}

// Start tags of one element, multi-line ones included, with each attribute's name and value span.
function* startTags(text, element) {
  const opener = new RegExp(`<${escapeRegex(element)}(?=[\\s/>])`, 'g');
  const name = /[^\s"'>/=]+/y;
  const equals = /\s*=\s*/y;
  const unquoted = /[^\s>]+/y;
  for (const found of text.matchAll(opener)) {
    let index = found.index + found[0].length;
    const attributes = [];
    while (index < text.length && text[index] !== '>') {
      if (/\s|\//.test(text[index])) {
        index++;
        continue;
      }
      name.lastIndex = index;
      const nameMatch = name.exec(text);
      if (!nameMatch) {
        index++;
        continue;
      }
      const attribute = { name: nameMatch[0], start: index, value: null };
      index = name.lastIndex;
      equals.lastIndex = index;
      if (equals.exec(text)) {
        index = equals.lastIndex;
        const quote = text[index];
        if (quote === '"' || quote === "'") {
          const close = text.indexOf(quote, index + 1);
          if (close === -1) return;
          attribute.value = text.slice(index + 1, close);
          index = close + 1;
        } else {
          unquoted.lastIndex = index;
          attribute.value = unquoted.exec(text)?.[0] ?? '';
          index = unquoted.lastIndex || index;
        }
      }
      attribute.end = index;
      attributes.push(attribute);
    }
    yield { attributes };
  }
}

// `--a, --b` and `A | B` lists pair up by position; a single new name may take every old one.
const pairs = (old, replacement) => {
  const olds = old.split(/\s*[,|]\s*/);
  const news = (replacement ?? '').split(/\s*[,|]\s*/);
  if (news.length === olds.length)
    return olds.map((name, index) => [name, news[index]]);
  if (news.length === 1) return olds.map((name) => [name, news[0]]);

  return null;
};

class Run {
  constructor(root) {
    this.root = root;
    this.files = new Map();
    this.dirty = new Set();
    for (const path of walk(root))
      this.files.set(
        relative(root, path).replace(/\\/g, '/'),
        readFileSync(path, 'utf8'),
      );
  }

  // Applies span replacements to one file and records each against the item.
  replace(report, path, replacements) {
    if (replacements.length === 0) return;
    const text = this.files.get(path);
    let result = text;
    for (const { start, end, after } of [...replacements].sort(
      (left, right) => right.start - left.start,
    )) {
      result = result.slice(0, start) + after + result.slice(end);
    }
    for (const { start, end, after } of replacements)
      report.edits.push({
        loc: `${path}:${lineAt(text, start)}`,
        before: text.slice(start, end),
        after,
      });
    report.files[path] = (report.files[path] ?? 0) + replacements.length;
    this.files.set(path, result);
    this.dirty.add(path);
  }

  leave(report, path, offset, match, reason, extra = {}) {
    report.left.push({
      loc: `${path}:${lineAt(this.files.get(path), offset)}`,
      match,
      el: extra.el ?? null,
      ...(extra.dynamic ? { dynamic: true } : {}),
      reason,
    });
  }

  // A refused item rewrites nothing, so each place `old` appears goes to the agents instead.
  leaveEveryOccurrence(report, item, reason) {
    const scoped = SCOPED_ATTRIBUTE.exec(item.old ?? '');
    if (scoped) {
      const [, element, name] = scoped;
      const bare = (attribute) =>
        attribute.replace(/^(?:bind-|on-)|^\[\(|\)\]$|^[[(]|[\])]$/g, '');
      for (const path of this.templateFiles())
        for (const tag of startTags(this.files.get(path), element))
          for (const attribute of tag.attributes)
            if (bare(attribute.name) === name)
              this.leave(
                report,
                path,
                attribute.start,
                attribute.name,
                reason,
                {
                  el: element,
                },
              );

      return;
    }
    const names = String(item.old ?? '')
      .split(/\s*[,|]\s*/)
      .map((name) => name.trim().split(/\s+/).at(-1))
      .filter(Boolean);
    const seen = new Set();
    for (const name of names) {
      const body = name.split('*').map(escapeRegex).join('[A-Za-z0-9_-]+');
      const pattern = new RegExp(
        `${/^[\w-]/.test(name) ? '(?<![\\w$-])' : ''}${body}${name.endsWith('-') ? '[A-Za-z0-9_-]*' : '(?![\\w$-])'}`,
        'g',
      );
      for (const [path, text] of this.files)
        for (const match of text.matchAll(pattern))
          if (!seen.has(`${path}:${match.index}`)) {
            seen.add(`${path}:${match.index}`);
            this.leave(report, path, match.index, match[0], reason);
          }
    }
  }

  // Every regex match in the selected files becomes a replacement; `rewrite` returns the new
  // text, or null to leave the match alone.
  replaceAll(report, pattern, selectFile, rewrite) {
    for (const [path, text] of this.files) {
      if (!selectFile(path)) continue;
      const replacements = [];
      for (const match of text.matchAll(pattern)) {
        const after = rewrite(match);
        if (after !== null && after !== match[0])
          replacements.push({
            start: match.index,
            end: match.index + match[0].length,
            after,
          });
      }
      this.replace(report, path, replacements);
    }
  }

  templateFiles() {
    return [...this.files.keys()].filter((path) => /\.(html|ts)$/.test(path));
  }

  attributeRename(report, item, forms) {
    const scoped = SCOPED_ATTRIBUTE.exec(item.old);
    if (!scoped) return 'old is not `element[attribute]`';
    const [, element, oldName] = scoped;
    const newName = /\[([^\]]+)\]$/.exec(item.new)?.[1] ?? item.new;
    if (!/^[A-Za-z][\w.-]*$/.test(newName ?? ''))
      return 'new is not an attribute name';
    const renames = new Map(
      forms.map(([prefix, suffix]) => [
        `${prefix}${oldName}${suffix}`,
        `${prefix}${newName}${suffix}`,
      ]),
    );
    for (const path of this.templateFiles()) {
      const replacements = [];
      for (const tag of startTags(this.files.get(path), element))
        for (const attribute of tag.attributes) {
          const renamed = renames.get(attribute.name);
          if (renamed)
            replacements.push({
              start: attribute.start,
              end: attribute.start + attribute.name.length,
              after: renamed,
            });
        }
      this.replace(report, path, replacements);
    }

    return null;
  }

  valueRemap(report, item) {
    const scoped = SCOPED_ATTRIBUTE.exec(item.old);
    if (!scoped) return 'old is not `element[attribute]`';
    if (!item.map || typeof item.map !== 'object') return 'no `map`';
    const [, element, name] = scoped;
    const bound = new Set([`[${name}]`, `bind-${name}`]);
    for (const path of this.templateFiles()) {
      const text = this.files.get(path);
      const replacements = [];
      for (const tag of startTags(text, element)) {
        const present = new Set(tag.attributes.map((each) => each.name));
        for (const attribute of tag.attributes) {
          const written = text.slice(attribute.start, attribute.end);
          if (
            bound.has(attribute.name) ||
            (attribute.name === name && attribute.value?.includes('{{'))
          ) {
            this.leave(
              report,
              path,
              attribute.start,
              written,
              'dynamic binding',
              {
                el: element,
                dynamic: true,
              },
            );
            continue;
          }
          if (attribute.name !== name || attribute.value === null) continue;
          if (!Object.hasOwn(item.map, attribute.value)) continue;
          const entry = item.map[attribute.value];
          if (entry === null) {
            const before = /\s*$/.exec(text.slice(0, attribute.start))[0];
            replacements.push({
              start: attribute.start - before.length,
              end: attribute.end,
              after: '',
            });
            continue;
          }
          const full = entry.includes('=') ? entry : null;
          if (full === `${name}="${attribute.value}"`) continue;
          const after =
            full ?? (entry === attribute.value ? entry : `${name}="${entry}"`);
          const added = [...after.matchAll(/([^\s=]+)(?:="[^"]*")?/g)]
            .map((match) => match[1])
            .filter((added) => added !== name && present.has(added));
          if (added.length > 0) {
            this.leave(
              report,
              path,
              attribute.start,
              written,
              `the replacement sets ${added.join(', ')}, which the tag already has`,
              { el: element },
            );
            continue;
          }
          replacements.push({
            start: attribute.start,
            end: attribute.end,
            after,
          });
        }
      }
      this.replace(report, path, replacements);
    }

    return null;
  }

  selectorRename(report, item) {
    const [old, replacement] = [item.old, item.new];
    if (ELEMENT.test(old) && ELEMENT.test(replacement ?? '')) {
      const tag = new RegExp(`(<\\/?)${escapeRegex(old)}(?![\\w-])`, 'g');
      const bare = new RegExp(
        `(?<![\\w.#$@%-])${escapeRegex(old)}(?![\\w-])`,
        'g',
      );
      for (const path of this.templateFiles()) {
        this.replaceAll(
          report,
          tag,
          (each) => each === path,
          (match) => match[1] + replacement,
        );
        for (const match of this.files.get(path).matchAll(bare))
          this.leave(
            report,
            path,
            match.index,
            match[0],
            'not a tag name: a string selector or inline style',
          );
      }
      this.replaceAll(
        report,
        bare,
        (path) => STYLE.has(extname(path)),
        () => replacement,
      );

      return null;
    }
    const element = /^([a-z][a-z0-9]*-[a-z0-9-]+)[.[:]/.exec(old)?.[1];
    if (!element || !replacement)
      return 'old is neither an element nor a compound selector on one';
    const compound = new RegExp(
      `(?<![\\w.#-])${escapeRegex(old)}(?![\\w-])`,
      'g',
    );
    this.replaceAll(
      report,
      compound,
      (path) => STYLE.has(extname(path)),
      () => replacement,
    );

    return null;
  }

  classRename(report, item) {
    const shape =
      /^([a-z][a-z0-9]*-[a-z0-9-]+)(\s+)?((?:\.[A-Za-z0-9_*-]+)+)$/.exec(
        item.old,
      );
    if (!shape) return "no element scope: the class may be the consumer's own";
    const [, scope, descendant, oldClasses] = shape;
    const newClasses = (item.new ?? '').replace(
      new RegExp(`^${escapeRegex(scope)}\\s*`),
      '',
    );
    const wildcards = (text) => (text.match(/\*/g) ?? []).length;
    if (
      !/^(?:\.[A-Za-z0-9_*-]+)+$/.test(newClasses) ||
      wildcards(oldClasses) !== wildcards(newClasses) ||
      wildcards(oldClasses) > 1
    )
      return 'new is not a class list of the same shape';
    const classes =
      escapeRegex(oldClasses).replace('\\*', '([a-z0-9-]+)') + '(?![\\w-])';
    const combinator = descendant ? '(\\s+(?:::ng-deep\\s+)?|\\s*>\\s*)' : '()';
    const scoped = new RegExp(
      `(?<![\\w.#-])${escapeRegex(scope)}${combinator}${classes}`,
      'g',
    );
    const isStyle = (path) => STYLE.has(extname(path));
    this.replaceAll(
      report,
      scoped,
      isStyle,
      (match) => scope + match[1] + newClasses.replace('*', match[2] ?? ''),
    );
    const mentionsScope = new RegExp(
      `(?<![\\w.#-])${escapeRegex(scope)}(?![\\w-])`,
    );
    const remaining = new RegExp(classes, 'g');
    for (const [path, text] of this.files) {
      if (!isStyle(path) || !mentionsScope.test(text)) continue;
      for (const match of text.matchAll(remaining))
        this.leave(
          report,
          path,
          match.index,
          match[0],
          `not written directly under ${scope}`,
          { el: scope },
        );
    }

    return null;
  }

  tokenRename(report, item) {
    const paired = pairs(item.old, item.new);
    if (!paired) return 'old and new name different numbers of tokens';
    const name = /^--[A-Za-z0-9-]+\*?[A-Za-z0-9-]*$/;
    if (
      !paired.every(
        ([old, replacement]) => name.test(old) && name.test(replacement ?? ''),
      )
    )
      return 'not a list of custom-property names';
    const pattern = (token) =>
      token.endsWith('-') && !token.includes('*') ? `${token}*` : token;
    const patterns = paired.map(([oldToken, newToken]) => [
      pattern(oldToken),
      pattern(newToken),
    ]);
    if (
      patterns.some(
        ([oldPattern, newPattern]) =>
          oldPattern.includes('*') !== newPattern.includes('*'),
      )
    )
      return 'a family renamed to a single name';
    for (const [oldPattern, newPattern] of patterns) {
      const regexOf = (token) =>
        token.split('*').map(escapeRegex).join('([A-Za-z0-9_-]+)');
      const old = new RegExp(
        `(?<![\\w-])${regexOf(oldPattern)}(?![\\w-])`,
        'g',
      );
      const migrated = new RegExp(`^${regexOf(newPattern)}$`);
      this.replaceAll(
        report,
        old,
        () => true,
        (match) =>
          migrated.test(match[0])
            ? null
            : newPattern.replace('*', match[1] ?? ''),
      );
    }

    return null;
  }

  typeRename(report, item) {
    const paired = pairs(item.old, item.new);
    if (
      !paired ||
      !paired.every(
        ([old, replacement]) =>
          IDENTIFIER.test(old) && IDENTIFIER.test(replacement ?? ''),
      )
    )
      return 'old is not an identifier or a list that pairs with new';
    const statement = new RegExp(
      `(?:import|export)\\s+(?:type\\s+)?\\{([^}]*)\\}\\s*from\\s*(['"])(${escapeRegex(PACKAGE)}(?:/[^'"]*)?)\\2`,
      'g',
    );
    const importedName = (specifier) =>
      specifier
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)[0];
    for (const [path, text] of this.files) {
      if (!path.endsWith('.ts')) continue;
      const imports = [...text.matchAll(statement)].map((match) => ({
        names: match[1].split(',').map(importedName),
        module: match[3],
      }));
      let renamed = false;
      for (const [old, replacement] of paired) {
        const word = new RegExp(
          `(?<![\\w$.])${escapeRegex(old)}(?![\\w$])`,
          'g',
        );
        if (
          imports.some(
            (each) => each.module === PACKAGE && each.names.includes(old),
          )
        ) {
          this.replaceAll(
            report,
            word,
            (each) => each === path,
            () => replacement,
          );
          renamed = true;
          continue;
        }
        const subpath = imports.find((each) =>
          each.names.includes(old),
        )?.module;
        for (const match of this.files.get(path).matchAll(word))
          this.leave(
            report,
            path,
            match.index,
            old,
            subpath
              ? `imported from ${subpath}: the new name may live in another entry point`
              : 'not imported from the design system in this file',
          );
      }
      if (renamed) this.dedupeImports(report, path, statement);
    }

    return null;
  }

  // Two old names renamed onto one new name leave it imported twice.
  dedupeImports(report, path, statement) {
    const text = this.files.get(path);
    const replacements = [];
    for (const match of text.matchAll(statement)) {
      const pieces = match[1].split(',');
      const seen = new Set();
      const kept = [];
      pieces.forEach((piece, index) => {
        const key = piece.trim();
        if (key && seen.has(key)) {
          if (index === pieces.length - 1 && kept.length > 0)
            kept[kept.length - 1] += /\s*$/.exec(piece)[0];
          return;
        }
        seen.add(key);
        kept.push(piece);
      });
      if (kept.length === pieces.length) continue;
      const start = match.index + match[0].indexOf('{') + 1;
      replacements.push({
        start,
        end: start + match[1].length,
        after: kept.join(','),
      });
    }
    this.replace(report, path, replacements);
  }

  write() {
    for (const path of this.dirty)
      writeFileSync(join(this.root, path), this.files.get(path));
  }
}

const ORDER = [
  'value-remap',
  'input-rename',
  'output-rename',
  'selector-rename',
  'class-rename',
  'token-rename',
  'type-rename',
];

const apply = (run, item, report) => {
  switch (item.kind) {
    case 'value-remap':
      return run.valueRemap(report, item);
    case 'input-rename':
      return run.attributeRename(report, item, [
        ['', ''],
        ['[', ']'],
        ['[(', ')]'],
        ['bind-', ''],
      ]);
    case 'output-rename':
      return run.attributeRename(report, item, [
        ['(', ')'],
        ['on-', ''],
      ]);
    case 'selector-rename':
      return run.selectorRename(report, item);
    case 'class-rename':
      return run.classRename(report, item);
    case 'token-rename':
      return run.tokenRename(report, item);
    default:
      return run.typeRename(report, item);
  }
};

const main = () => {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const [root, ...manifests] = argv.filter(
    (argument) => argument !== '--dry-run',
  );
  if (!root || manifests.length === 0) {
    console.error(
      'usage: node apply-mechanical.mjs <source-root> <migrations/V.json>... [--dry-run]',
    );

    return 2;
  }
  const run = new Run(root);
  const items = [];
  for (const manifest of manifests) {
    const { version, items: manifestItems = [] } = JSON.parse(
      readFileSync(manifest, 'utf8'),
    );
    const mechanical = manifestItems
      .filter((item) => ORDER.includes(item.kind))
      .sort(
        (left, right) =>
          ORDER.indexOf(left.kind) - ORDER.indexOf(right.kind) ||
          String(right.old).length - String(left.old).length,
      );
    for (const item of mechanical) {
      const report = {
        version,
        id: item.id,
        kind: item.kind,
        status: '',
        files: {},
        edits: [],
        left: [],
      };
      const reason = apply(run, item, report);
      if (reason) {
        report.reason = reason;
        run.leaveEveryOccurrence(report, item, reason);
      }
      if (report.edits.length > 0)
        report.status = report.left.length > 0 ? 'partial' : 'applied';
      else report.status = report.left.length > 0 ? 'left' : 'untouched';
      items.push(report);
    }
  }
  if (!dryRun) run.write();
  for (const report of items) {
    if (report.status === 'untouched' && !report.reason) continue;
    const files = Object.entries(report.files)
      .map(([path, count]) => `${path} (${count})`)
      .join(', ');
    console.error(
      `${report.version}#${report.id}: ${report.status}` +
        (report.reason ? ` - ${report.reason}` : '') +
        (files ? ` - ${report.edits.length} edit(s): ${files}` : '') +
        (report.left.length ? ` - ${report.left.length} left` : ''),
    );
  }
  process.stdout.write(`${JSON.stringify({ dryRun, root, items }, null, 2)}\n`);

  return 0;
};

process.exitCode = main();
