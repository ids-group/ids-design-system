#!/usr/bin/env node
// Read-only audit of how far a project's styles are on design-system tokens:
//
//   npx ids-design-system-token-report "src/**/*.{scss,css,ts}" [--ignore <glob>]... [--json <file>]
//
// Lints every matched .scss and .css file, and every inline `styles` template of a matched .ts
// file, with `use-tokens` and `known-tokens` only, then prints the findings with their suggestions
// and the counts per category, property, file and value. Names the project declares in the matched
// files, ignored ones included, or in the template beside a matched component count as known.
// Nothing is written except the `--json` file.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';
import stylelint from 'stylelint';
import knownTokens, { ruleName as knownName } from './known-tokens.mjs';
import useTokens, { ruleName as useName } from './use-tokens.mjs';

const fastGlob = createRequire(import.meta.resolve('stylelint'))('fast-glob');

const args = process.argv.slice(2);
const flag = (name) =>
  args.flatMap((arg, index) => (args[index - 1] === name ? [arg] : []));
const globs = args.filter(
  (arg, index) =>
    !arg.startsWith('--') && !['--ignore', '--json'].includes(args[index - 1]),
);
if (!globs.length) {
  console.error(
    'usage: ids-design-system-token-report <glob>... [--ignore <glob>]... [--json <file>]',
  );
  process.exit(2);
}
const built = ['**/node_modules/**', '**/dist/**', '**/.angular/**'];
const ignore = [...built, ...flag('--ignore')];
const jsonOut = flag('--json')[0];
const asGlob = (pattern) => pattern.replaceAll('\\', '/');

const scssSyntax = () => {
  for (const base of [join(process.cwd(), 'noop.js'), import.meta.url]) {
    try {
      return createRequire(base)('postcss-scss');
    } catch {}
  }
  console.error(
    'Reading .scss needs postcss-scss: npm install -D postcss-scss',
  );
  process.exit(2);
};

const files = fastGlob
  .sync(globs.map(asGlob), { ignore, absolute: true })
  .filter((file) => /\.(scss|css|ts)$/.test(file))
  .sort();
const display = (file) => relative(process.cwd(), file).replaceAll('\\', '/');

const sources = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  if (!file.endsWith('.ts')) {
    sources.push({
      file,
      code: text,
      lineOffset: 0,
      scss: file.endsWith('.scss'),
    });
    continue;
  }
  for (const match of text.matchAll(/styles\s*:\s*\[?\s*`([\s\S]*?)`/g)) {
    const start = match.index + match[0].indexOf('`');
    sources.push({
      file,
      code: match[1].replace(/\$\{[^}]*\}/g, '0'),
      lineOffset: text.slice(0, start).split('\n').length - 1,
      scss: true,
    });
  }
}

// An ignored file still declares names (a brand layer), and a component sets custom properties
// from its template too (`[style.--x]`).
const declaring = fastGlob
  .sync(globs.map(asGlob), { ignore: built, absolute: true })
  .filter((file) => /.(scss|css|ts)$/.test(file));
const templates = declaring
  .map((file) => file.replace(/\.ts$/, '.html'))
  .filter((file) => file.endsWith('.html') && existsSync(file));

const config = {
  plugins: [useTokens, knownTokens],
  rules: {
    [useName]: true,
    [knownName]: [true, { declarationsFrom: [...declaring, ...templates] }],
  },
};
const syntax = sources.some((source) => source.scss) ? scssSyntax() : undefined;

const KIND = [
  [/ has no exact token, nearest /, 'nearest'],
  [/ matches no design-system colour$/, 'none'],
  [/, use /, 'exact'],
];
const findings = [];
for (const source of sources) {
  const { results } = await stylelint.lint({
    code: source.code,
    codeFilename: source.file,
    config: { ...config, customSyntax: source.scss ? syntax : undefined },
  });
  for (const warning of results[0].warnings) {
    const text = warning.text.replace(/ \(ids-design-system\/[\w-]+\)$/, '');
    const base = {
      file: display(source.file),
      line: warning.line + source.lineOffset,
      text,
    };
    if (warning.rule === knownName) {
      findings.push({
        ...base,
        category: 'unknown-token',
        prop: '',
        raw: text.match(/"(--[\w-]+)"/)[1],
        kind: 'unknown',
      });
    } else if (warning.rule === useName) {
      const [, category, raw, prop] = text.match(
        /^([\w-]+): raw "([\s\S]*?)" in ([\w-]+)/,
      );
      const kind = KIND.find(([pattern]) => pattern.test(text))[1];
      findings.push({ ...base, category, prop, raw, kind });
    }
  }
}

const countBy = (key) =>
  Object.entries(
    findings.reduce((counts, finding) => {
      counts[key(finding)] = (counts[key(finding)] ?? 0) + 1;
      return counts;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
const table = (title, rows) => {
  console.log(`\n${title}`);
  for (const [label, count] of rows)
    console.log(`  ${String(count).padStart(5)}  ${label}`);
};

console.log('findings');
for (const finding of findings)
  console.log(`  ${finding.file}:${finding.line}  ${finding.text}`);
console.log(
  `\nfiles ${files.length}, style sources ${sources.length} (inline .ts templates ${sources.filter((source) => source.file.endsWith('.ts')).length})`,
);
const tokenFindings = findings.filter((finding) => finding.kind !== 'unknown');
console.log(
  `use-tokens ${tokenFindings.length} in ${new Set(tokenFindings.map((finding) => finding.file)).size} files, known-tokens ${findings.length - tokenFindings.length}`,
);
table(
  'by category',
  countBy((finding) => finding.category),
);
table(
  'by category and kind',
  countBy((finding) => `${finding.category} ${finding.kind}`),
);
table(
  'by property',
  countBy((finding) => finding.prop).filter(([prop]) => prop),
);
table(
  'by file',
  countBy((finding) => finding.file),
);
table(
  'by value',
  countBy((finding) => `${finding.category} ${finding.raw}`),
);
if (jsonOut)
  writeFileSync(
    jsonOut,
    JSON.stringify(
      { files: files.length, sources: sources.length, findings },
      null,
      1,
    ),
  );
