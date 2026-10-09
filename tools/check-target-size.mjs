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
// Two targets must not overlap: where two controls sit side by side in one element and either takes
// the mixin, the `gap` of that element's rule must hold what each target grows past its box, half of
// `--hit-xs` less the `ds-icon` size it draws. A text control grows by nothing along the row.
//
//   node tools/check-target-size.mjs
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

const COMPONENTS =
  process.env.DS_TARGET_SIZE_COMPONENTS ?? 'src/lib/components';
const STYLES = process.env.DS_TARGET_SIZE_STYLES ?? 'src/lib/styles';
const GUARD = /target-size-guard:\s*\S/;
const MIXIN = /@include\s+target\.min-size\b/;
const TOKENS = join(STYLES, '_tokens.scss');

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

const tokens = new Map(
  existsSync(TOKENS)
    ? [
        ...readFileSync(TOKENS, 'utf8').matchAll(
          /(--[\w-]+):\s*(-?[\d.]+)px\s*;/g,
        ),
      ].map((match) => [match[1], Number(match[2])])
    : [],
);
const HIT = tokens.get('--hit-xs') ?? 24;

const pixels = (value) => {
  const literal = /^(-?[\d.]+)px$/.exec(value) ?? /^(0)$/.exec(value);
  if (literal) return Number(literal[1]);
  const token = /^var\((--[\w-]+)\)$/.exec(value);
  return token && tokens.has(token[1]) ? tokens.get(token[1]) : null;
};

// The element whose children the control at `index` is: the last tag opened before it and not closed.
const parentAt = (template, index) => {
  const stack = [];
  for (const match of template
    .slice(0, index)
    .replace(/<!--[\s\S]*?-->/g, '')
    .matchAll(/<(\/?)([a-zA-Z][\w-]*)\b([^>]*?)(\/?)>/g)) {
    if (match[4] || /^(input|img|br|hr)$/i.test(match[2])) continue;
    if (match[1]) {
      const open = stack.findLastIndex((tag) => tag.name === match[2]);
      if (open !== -1) stack.length = open;
    } else stack.push({ name: match[2], attributes: match[3] });
  }
  return stack.at(-1);
};

const declared = (rules, property) =>
  rules
    .map((rule) =>
      new RegExp(`(?:^|[\\s;{])${property}:\\s*([^;]+);`).exec(rule),
    )
    .find(Boolean)?.[1]
    .trim();

// The side of an icon-only control as drawn: its declared width, or its icon and padding.
const boxOf = (rules, inner) => {
  const width = pixels(declared(rules, 'width') ?? '');
  if (width !== null) return width;
  const icon = /<ds-icon\b[^>]*?\[?size\]?="(\d+)"/.exec(inner);
  const padding = pixels(declared(rules, 'padding') ?? '0') ?? 0;
  return (icon ? Number(icon[1]) : 0) + 2 * padding;
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
  const where = relative(process.cwd(), file).split('\\').join('/');
  for (const template of templatesOf(file)) {
    let previous = null;
    for (const match of template.matchAll(
      /<(button|a)\b([^>]*)>([\s\S]*?)<\/\1>/g,
    )) {
      const className = (/\bclass="([^"\s]+)/.exec(match[2]) ?? [])[1];
      const rules =
        className === undefined ? [] : rulesFor(className, scssFiles);
      const targeted = rules.some((rule) => MIXIN.test(rule));
      const inFlow = !rules.some((rule) => /position:\s*absolute/.test(rule));
      const control = {
        name: className ? `.${className}` : `<${match[1]}>`,
        start: match.index,
        end: match.index + match[0].length,
        grows:
          targeted && inFlow && iconOnly(match[3])
            ? Math.max(0, (HIT - boxOf(rules, match[3])) / 2)
            : 0,
      };
      const adjacent =
        previous !== null &&
        iconOnly(template.slice(previous.end, control.start));
      const needed = adjacent ? previous.grows + control.grows : 0;
      if (needed > 0) {
        const parent = parentAt(template, previous.start);
        const parentClass = (/\bclass="([^"\s]+)/.exec(
          parent?.attributes ?? '',
        ) ?? [])[1];
        const parentRules = parentClass
          ? rulesFor(parentClass, scssFiles)
          : [];
        const gapValue =
          declared(parentRules, 'column-gap') ?? declared(parentRules, 'gap');
        const gap =
          gapValue === undefined ? 0 : pixels(gapValue.split(/\s+/).at(-1));
        if (gap === null || gap < needed) {
          problems.push(
            `${where}: ${previous.name} and ${control.name} sit side by side in ${parentClass ? `.${parentClass}` : `<${parent?.name}>`} with a gap of ${gapValue ?? 'nothing'}, and their targets reach ${needed}px into it - set a gap of at least ${needed}px`,
          );
        }
      }
      previous = control;
      if (!iconOnly(match[3])) continue;
      controls += 1;
      const preceding = template.slice(0, match.index).trimEnd();
      if (
        /<!--[^]*?-->$/.test(preceding) &&
        GUARD.test(preceding.slice(preceding.lastIndexOf('<!--')))
      )
        continue;
      if (!className) {
        problems.push(
          `${where}: an icon-only <${match[1]}> with no class - give it a class whose rule includes target.min-size, or put <!-- target-size-guard: <size> --> right before it`,
        );
        continue;
      }
      if (
        targeted ||
        rulesFor(className, scssFiles).some((rule) => GUARD.test(rule))
      )
        continue;
      problems.push(
        `${where}: .${className} is an icon-only <${match[1]}> - include target.min-size in its rule, or write target-size-guard: <size> above the rule when it is at least --hit-xs`,
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
    `target-size: ${problems.length} target problem(s):\n  ${problems.join('\n  ')}`,
  );
  process.exit(1);
}
console.log(
  `target-size: OK - ${controls} icon-only controls, each with a --hit-xs target or a stated size.`,
);
