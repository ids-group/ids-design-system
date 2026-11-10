// `ids-design-system/known-tokens`: reports a `var(--name)` whose name nothing declares, neither the
// design system nor the consumer's own sources. Such a read falls back or resolves to nothing, and
// looks exactly like a working token.
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import stylelint from 'stylelint';
import { libraryNames } from './tokens.mjs';

const fromStylelint = createRequire(import.meta.resolve('stylelint'));
const fastGlob = fromStylelint('fast-glob');

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

export const ruleName = 'ids-design-system/known-tokens';

const deprecated = new Set(
  JSON.parse(
    readFileSync(new URL('./deprecated-tokens.json', import.meta.url), 'utf8'),
  ).map((entry) => entry.name),
);

const messages = ruleMessages(ruleName, {
  unknown: (name, closest) =>
    `"${name}" is declared neither by the design system nor in this project${closest ? `, did you mean "${closest}"?` : ''}`,
});

const NAME = /(?<![\w-])--[a-zA-Z][\w-]*/g;
const READ = /var\(\s*(--[a-zA-Z][\w-]*)/g;

// Any name in a scanned file that is not a `var()` read counts as declared there: a stylesheet
// declaration, `[style.--x]` in a template, `setProperty('--x', …)` in TypeScript.
const scanned = new Map();
const declaredIn = (globs) => {
  const key = JSON.stringify(globs);
  if (!scanned.has(key)) {
    const names = new Set();
    const paths = globs.filter((entry) => existsSync(entry));
    const patterns = globs.filter((entry) => !existsSync(entry));
    for (const file of [
      ...paths,
      ...fastGlob.sync(patterns, {
        ignore: ['**/node_modules/**', '**/dist/**', '**/.angular/**'],
        absolute: true,
      }),
    ]) {
      const text = readFileSync(file, 'utf8');
      for (const match of text.matchAll(NAME)) {
        const before = text.slice(Math.max(0, match.index - 8), match.index);
        if (!/var\(\s*$/.test(before)) names.add(match[0]);
      }
    }
    scanned.set(key, names);
  }
  return scanned.get(key);
};

// Only a size name one letter longer or shorter is offered (`--radius-s` is `--radius-sm`,
// `--font-size-sm` is `--font-size-s`): any other edit inside a scale points at the wrong step, as
// `--font-size-xl` at `--font-size-xs`.
const closestLibraryName = (name) =>
  [...libraryNames].find(
    (candidate) =>
      (candidate.startsWith(name) &&
        /^[a-z]$/.test(candidate.slice(name.length))) ||
      (name.startsWith(candidate) &&
        /^[a-z]$/.test(name.slice(candidate.length))),
  );

const rule =
  (primary, secondary = {}) =>
  (root, result) => {
    if (
      !validateOptions(
        result,
        ruleName,
        { actual: primary },
        {
          actual: secondary,
          possible: {
            declarationsFrom: [(value) => typeof value === 'string'],
            ignore: [(value) => typeof value === 'string'],
          },
          optional: true,
        },
      )
    )
      return;

    const fromProject = secondary.declarationsFrom?.length
      ? declaredIn(secondary.declarationsFrom)
      : new Set();
    const ignored = (secondary.ignore ?? []).map((pattern) =>
      pattern.startsWith('/') && pattern.endsWith('/')
        ? new RegExp(pattern.slice(1, -1))
        : new RegExp(
            `^${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*')}$`,
          ),
    );
    const local = new Set();
    root.walkDecls((declaration) => {
      if (declaration.prop.startsWith('--')) local.add(declaration.prop);
    });
    const known = (name) =>
      libraryNames.has(name) ||
      local.has(name) ||
      fromProject.has(name) ||
      deprecated.has(name) ||
      ignored.some((pattern) => pattern.test(name));

    root.walkDecls((declaration) => {
      if (declaration.value.includes('#{')) return;
      const valueIndex =
        declaration.prop.length + (declaration.raws.between ?? ':').length;
      for (const match of declaration.value.matchAll(READ)) {
        const name = match[1];
        if (known(name)) continue;
        const index = valueIndex + match.index + match[0].indexOf(name);
        report({
          ruleName,
          result,
          node: declaration,
          index,
          endIndex: index + name.length,
          message: messages.unknown(name, closestLibraryName(name)),
        });
      }
    });
  };

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = {
  url: 'https://www.npmjs.com/package/@ids-group-ltd/ids-design-system',
};

export default createPlugin(ruleName, rule);
