#!/usr/bin/env node
// Every icon-only control in the library has a pointer target of at least `--hit-xs` (24px). A
// `<button>` or `<a>` in a component template whose only content is a `ds-icon` or an `svg` passes
// when a rule for its first class includes `target.min-size` (directly or through a mixin from
// `src/lib/styles`), or when it carries `target-size-guard: <its size>` because it is at least
// `--hit-xs` by its own size. The guard sits on the line above the rule or the mixin, or as an HTML
// comment right before a control that has no class.
//
// Content behind `@if` counts as content: a control that is icon-only only for some inputs, such
// as a `ds-breadcrumbs` item with an icon and no label, is not seen here and is covered by hand.
//
//   node tools/check-target-size.mjs
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

const COMPONENTS =
  process.env.DS_TARGET_SIZE_COMPONENTS ?? 'src/lib/components';
const STYLES = process.env.DS_TARGET_SIZE_STYLES ?? 'src/lib/styles';
const GUARD = /target-size-guard:\s*\S/;
const MIXIN = /@include\s+target\.min-size\(/;

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const templatesOf = (file) => {
  const text = readFileSync(file, 'utf8');
  if (file.endsWith('.html')) return [text];
  return [...text.matchAll(/template:\s*`([\s\S]*?)`/g)].map(
    (match) => match[1],
  );
};

const iconOnly = (inner) =>
  inner
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<ds-icon\b[\s\S]*?(\/>|<\/ds-icon>)/g, '')
    .replace(/<svg\b[\s\S]*?<\/svg>/g, '')
    .replace(/@(if|else|for|switch|case)[^{]*\{|\}/g, '')
    .trim() === '';

// The body of the block that opens at `open` (the index of its `{`).
const blockAt = (text, open) => {
  let depth = 0;
  for (let index = open; index < text.length; index += 1) {
    if (text[index] === '{') depth += 1;
    if (text[index] === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(open + 1, index);
    }
  }
  return text.slice(open + 1);
};

const linesBefore = (text, index, count) =>
  text
    .slice(0, index)
    .split('\n')
    .slice(-count - 1)
    .join('\n');

const mixinBody = (alias, name, uses) => {
  const file = uses.get(alias);
  if (!file || !existsSync(file)) return '';
  const text = readFileSync(file, 'utf8');
  const match = new RegExp(`@mixin\\s+${name}\\b[^{]*\\{`).exec(text);
  if (!match) return '';
  return (
    linesBefore(text, match.index, 2) +
    blockAt(text, match.index + match[0].length - 1)
  );
};

const usesOf = (text, from) => {
  const uses = new Map();
  for (const match of text.matchAll(/@use\s+'([^']+)'(?:\s+as\s+([\w-]+))?/g)) {
    const path = match[1];
    const alias = match[2] ?? path.split('/').pop();
    const base = path.split('/').pop();
    uses.set(
      alias,
      join(
        path.startsWith('.') ? dirname(from) : STYLES,
        dirname(path),
        `_${base}.scss`,
      ),
    );
  }
  return uses;
};

// Every rule body (and the lines above its selector) that names `.className`, with the mixins it
// includes expanded one level.
const rulesFor = (className, scssFiles) => {
  const selector = new RegExp(`\\.${className}(?![\\w-])`, 'g');
  const found = [];
  for (const file of scssFiles) {
    const text = readFileSync(file, 'utf8');
    const uses = usesOf(text, file);
    for (const match of text.matchAll(selector)) {
      const rest = text.slice(match.index);
      const brace = rest.search(/[{;}]/);
      if (brace === -1 || rest[brace] !== '{') continue;
      const open = match.index + brace;
      // From the end of the previous statement or block to the selector: the comments above the rule.
      const above = text.slice(
        Math.max(
          ...['}', '{', ';'].map((c) => text.lastIndexOf(c, match.index)),
        ) + 1,
        match.index,
      );
      let body = blockAt(text, open);
      for (const include of body.matchAll(/@include\s+([\w-]+)\.([\w-]+)/g)) {
        body += mixinBody(include[1], include[2], uses);
      }
      found.push(above + body);
    }
  }
  return found;
};

const problems = [];
let controls = 0;
for (const file of walk(COMPONENTS).filter(
  (f) => /\.(html|ts)$/.test(f) && !f.endsWith('.spec.ts'),
)) {
  const dir = dirname(file);
  const scssFiles = readdirSync(dir)
    .filter((f) => f.endsWith('.scss'))
    .map((f) => join(dir, f));
  for (const template of templatesOf(file)) {
    for (const match of template.matchAll(
      /<(button|a)\b([^>]*)>([\s\S]*?)<\/\1>/g,
    )) {
      if (!iconOnly(match[3])) continue;
      controls += 1;
      const where = relative(process.cwd(), file).split('\\').join('/');
      const preceding = template.slice(0, match.index).trimEnd();
      if (
        /<!--[^]*?-->$/.test(preceding) &&
        GUARD.test(preceding.slice(preceding.lastIndexOf('<!--')))
      )
        continue;
      const className = (/\bclass="([^"\s]+)/.exec(match[2]) ?? [])[1];
      if (!className) {
        problems.push(
          `${where}: an icon-only <${match[1]}> with no class - give it a class whose rule includes target.min-size, or put <!-- target-size-guard: <size> --> right before it`,
        );
        continue;
      }
      const rules = rulesFor(className, scssFiles);
      if (rules.some((rule) => MIXIN.test(rule) || GUARD.test(rule))) continue;
      problems.push(
        `${where}: .${className} is an icon-only <${match[1]}> - include target.min-size(<its box>) in its rule, or write target-size-guard: <size> above the rule when it is at least --hit-xs`,
      );
    }
  }
}

if (controls === 0) {
  console.error(
    'target-size: found no icon-only control at all - the template scan matched nothing',
  );
  process.exit(1);
}
if (problems.length > 0) {
  console.error(
    `target-size: ${problems.length} icon-only control(s) without a --hit-xs target:\n  ${problems.join('\n  ')}`,
  );
  process.exit(1);
}
console.log(
  `target-size: OK - ${controls} icon-only controls, each with a --hit-xs target or a stated size.`,
);
