#!/usr/bin/env node
// Runs the design system's own lint plugins over a consumer's source for one version step and
// prints every report as a located hit keyed by its manifest item, read-only: the ESLint plugin
// over `.ts` (inline templates included) and `.html`, the stylelint plugin over `.css` and `.scss`.
// The plugins come from <plugin-dir> (a directory holding `eslint/index.mjs` and
// `stylelint/index.mjs`: an extracted release tag or the installed package root); eslint,
// stylelint and the parsers come from the consumer's own `node_modules`, found from
// <consumer-root> upward. The consumer's lint config is never read or written: the config is
// passed through the linters' Node API. A linter or parser the consumer lacks is skipped and named
// in `skipped`.
//
//   node lint-step.mjs <consumer-root> <source-root> <plugin-dir> --from <V> [--to <V>]
//
// `from` is exclusive and `to` inclusive, as in the plugins; without `to` the unreleased version
// counts too. Output (stdout, JSON):
//   { from, to, ran: [], skipped: [], errors: [{ loc, message }],
//     hits: { "<version>#<item-id>": [{ loc, match, el: null, rule, message }] } }
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const RULE_PREFIX = 'ids-design-system/';
const ITEM_ID = /\(([^()\s]+#[^()\s]+)\)/;
const IGNORED = ['**/node_modules/**', '**/dist/**', '**/.angular/**'];

const pickExport = (target) => {
  if (typeof target === 'string') return target;
  if (!target || typeof target !== 'object') return undefined;
  for (const condition of ['node', 'import', 'default', 'require'])
    if (condition in target) {
      const picked = pickExport(target[condition]);
      if (picked) return picked;
    }

  return undefined;
};

// Node resolution from <consumer-root>, without a file of ours inside the consumer to resolve from.
export const resolvePackage = (fromDirectory, name) => {
  for (let directory = resolve(fromDirectory); ; ) {
    const packageDirectory = join(directory, 'node_modules', name);
    const manifestPath = join(packageDirectory, 'package.json');
    if (existsSync(manifestPath)) {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      const exported =
        typeof manifest.exports === 'object' && !Array.isArray(manifest.exports)
          ? '.' in manifest.exports
            ? manifest.exports['.']
            : manifest.exports
          : manifest.exports;
      const entry = pickExport(exported) ?? manifest.main ?? 'index.js';

      return join(packageDirectory, entry);
    }
    const parent = dirname(directory);
    if (parent === directory) return undefined;
    directory = parent;
  }
};

const importFirst = async (fromDirectory, candidates) => {
  for (const [name, pick] of candidates) {
    const path = resolvePackage(fromDirectory, name);
    if (!path || !existsSync(path)) continue;
    const module = await import(pathToFileURL(path).href);
    const value = pick(module.default ?? module, module);
    if (value) return value;
  }

  return undefined;
};

const lineText = (text, line) => text.split(/\r?\n/)[line - 1] ?? '';

const matchText = (text, { line, column, endLine, endColumn }) => {
  if (!endLine || endLine !== line) return lineText(text, line).trim();

  return lineText(text, line).slice(column - 1, endColumn - 1);
};

export const lintStep = async ({
  consumerRoot,
  sourceRoot,
  pluginDirectory,
  from,
  to,
}) => {
  const range = to ? { from, to } : { from };
  const output = {
    from,
    to: to ?? null,
    ran: [],
    skipped: [],
    errors: [],
    hits: {},
  };
  const located = (path) => relative(sourceRoot, path).replace(/\\/g, '/');
  const texts = new Map();
  const textOf = (path) => {
    if (!texts.has(path)) texts.set(path, readFileSync(path, 'utf8'));

    return texts.get(path);
  };
  const addHit = (path, rule, message, position) => {
    const itemId = ITEM_ID.exec(message)?.[1];
    if (!itemId) return;
    (output.hits[itemId] ??= []).push({
      loc: `${located(path)}:${position.line}`,
      match: matchText(textOf(path), position),
      el: null,
      rule,
      message,
    });
  };

  const eslintPlugin = join(pluginDirectory, 'eslint', 'index.mjs');
  const eslintModule = await importFirst(consumerRoot, [
    [
      'eslint',
      (module, namespace) => namespace.loadESLint ?? module.loadESLint,
    ],
  ]);
  if (!existsSync(eslintPlugin))
    output.skipped.push(`eslint: ${eslintPlugin} does not exist`);
  else if (!eslintModule)
    output.skipped.push(
      'eslint: not installed in the consumer, or older than 8.57 (no flat-config API)',
    );
  else {
    const plugin = (await import(pathToFileURL(eslintPlugin).href)).default;
    const ESLint = await eslintModule({ useFlatConfig: true });
    const typescriptParser = await importFirst(consumerRoot, [
      ['typescript-eslint', (module) => module.parser],
      [
        '@typescript-eslint/parser',
        (module) => module.parseForESLint && module,
      ],
    ]);
    const templateParser = await importFirst(consumerRoot, [
      ['angular-eslint', (module) => module.templateParser],
      [
        '@angular-eslint/template-parser',
        (module) => module.parseForESLint && module,
      ],
    ]);
    const inlineTemplates = await importFirst(consumerRoot, [
      ['angular-eslint', (module) => module.processInlineTemplates],
      [
        '@angular-eslint/eslint-plugin-template',
        (module) => module.processors?.['extract-inline-html'],
      ],
    ]);
    const blocks = [];
    const patterns = [];
    if (typescriptParser) {
      blocks.push({
        files: ['**/*.ts'],
        languageOptions: { parser: typescriptParser },
        ...(templateParser && inlineTemplates
          ? { processor: inlineTemplates }
          : {}),
      });
      patterns.push('**/*.ts');
      output.ran.push('eslint:ts');
      if (!(templateParser && inlineTemplates))
        output.skipped.push(
          'eslint: inline templates (needs @angular-eslint/template-parser and the extract-inline-html processor)',
        );
    } else
      output.skipped.push(
        'eslint: .ts files (needs typescript-eslint or @typescript-eslint/parser)',
      );
    if (templateParser) {
      blocks.push({
        files: ['**/*.html'],
        languageOptions: { parser: templateParser },
      });
      patterns.push('**/*.html');
      output.ran.push('eslint:html');
    } else
      output.skipped.push(
        'eslint: .html templates (needs @angular-eslint/template-parser)',
      );
    if (patterns.length > 0) {
      const eslint = new ESLint({
        cwd: sourceRoot,
        overrideConfigFile: true,
        errorOnUnmatchedPattern: false,
        overrideConfig: [
          { ignores: IGNORED },
          {
            linterOptions: {
              noInlineConfig: true,
              reportUnusedDisableDirectives: 'off',
            },
          },
          ...blocks,
          plugin.configs.recommendedFrom(from, to),
        ],
      });
      for (const result of await eslint.lintFiles(patterns))
        for (const message of result.messages) {
          if (message.ruleId?.startsWith(RULE_PREFIX))
            addHit(result.filePath, message.ruleId, message.message, message);
          else if (message.fatal)
            output.errors.push({
              loc: `${located(result.filePath)}:${message.line ?? 0}`,
              message: message.message,
            });
        }
    }
  }

  const stylelintPlugin = join(pluginDirectory, 'stylelint', 'index.mjs');
  const stylelintPath = resolvePackage(consumerRoot, 'stylelint');
  if (!existsSync(stylelintPlugin))
    output.skipped.push(`stylelint: ${stylelintPlugin} does not exist`);
  else if (!stylelintPath)
    output.skipped.push('stylelint: not installed in the consumer');
  else {
    const stylelintUrl = pathToFileURL(stylelintPath).href;
    const stylelint = (await import(stylelintUrl)).default;
    // The plugin imports `stylelint` by name, which resolves from where the plugin file sits; a
    // copy pointed at the consumer's stylelint loads outside any node_modules and shares one
    // instance with the linter that runs it.
    const copy = mkdtempSync(join(tmpdir(), 'ds-lint-step-'));
    try {
      cpSync(join(pluginDirectory, 'stylelint'), copy, { recursive: true });
      const copiedPlugin = join(copy, 'index.mjs');
      writeFileSync(
        copiedPlugin,
        readFileSync(copiedPlugin, 'utf8').replace(
          /from 'stylelint'/,
          `from '${stylelintUrl}'`,
        ),
      );
      const plugin = (await import(pathToFileURL(copiedPlugin).href)).default;
      const scss = await importFirst(consumerRoot, [
        ['postcss-scss', (module) => module.parse && module],
      ]);
      if (!scss)
        output.skipped.push(
          'stylelint: .scss parsed as CSS (postcss-scss is not installed)',
        );
      const { results } = await stylelint.lint({
        files: ['**/*.css', '**/*.scss'],
        cwd: sourceRoot,
        ignoreDisables: true,
        allowEmptyInput: true,
        config: {
          ignoreFiles: IGNORED,
          plugins: [plugin],
          rules: { [`${RULE_PREFIX}no-removed-tokens`]: [true, range] },
          ...(scss
            ? { overrides: [{ files: ['**/*.scss'], customSyntax: scss }] }
            : {}),
        },
      });
      output.ran.push('stylelint');
      for (const result of results)
        for (const warning of result.warnings) {
          if (warning.rule?.startsWith(RULE_PREFIX))
            addHit(result.source, warning.rule, warning.text, warning);
          else if (warning.severity === 'error')
            output.errors.push({
              loc: `${located(result.source)}:${warning.line ?? 0}`,
              message: warning.text,
            });
        }
    } finally {
      rmSync(copy, { recursive: true, force: true });
    }
  }

  for (const hits of Object.values(output.hits))
    hits.sort((left, right) =>
      left.loc.localeCompare(right.loc, 'en', { numeric: true }),
    );

  return output;
};

const main = async (argv) => {
  const flag = (name) => {
    const index = argv.indexOf(name);

    return index === -1 ? undefined : argv.splice(index, 2)[1];
  };
  const from = flag('--from');
  const to = flag('--to');
  const [consumerRoot, sourceRoot, pluginDirectory] = argv;
  if (!consumerRoot || !sourceRoot || !pluginDirectory || !from) {
    console.error(
      'usage: node lint-step.mjs <consumer-root> <source-root> <plugin-dir> --from <V> [--to <V>]',
    );

    return 2;
  }
  const output = await lintStep({
    consumerRoot,
    sourceRoot: resolve(sourceRoot),
    pluginDirectory: resolve(pluginDirectory),
    from,
    to,
  });
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);

  return 0;
};

if (import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = await main(process.argv.slice(2));
