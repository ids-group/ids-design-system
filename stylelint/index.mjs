// Stylelint plugin for consumers of @ids-group-ltd/ids-design-system. The rule
// `ids-design-system/no-removed-tokens` reports every custom property this library removed or
// renamed, read from `deprecated-tokens.json` (generated from the published migration manifests),
// and autofixes a rename to the current name.
import { readFileSync } from 'node:fs';
import stylelint from 'stylelint';
import { VERSION, inRange } from './since-version.mjs';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = 'ids-design-system/no-removed-tokens';

const deprecatedTokens = new Map(
  JSON.parse(
    readFileSync(new URL('./deprecated-tokens.json', import.meta.url), 'utf8'),
  ).map((entry) => [entry.name, entry]),
);

const messages = ruleMessages(ruleName, {
  renamed: (name, replacement, since, itemId) =>
    `"${name}" was renamed to "${replacement}" in ${since} (${itemId})`,
  removed: (name, replacement, since, itemId) =>
    `"${name}" was removed in ${since}${replacement ? `, use ${replacement}` : ''} (${itemId})`,
});

// The whole dashed name, so `--x-warn` is never found inside `--x-warning`.
const CUSTOM_PROPERTY = /(?<![\w-])--[\w-]+/g;

const rule = (primary, secondary) => (root, result) => {
  if (
    !validateOptions(
      result,
      ruleName,
      { actual: primary },
      {
        actual: secondary,
        possible: {
          from: (value) => typeof value === 'string' && VERSION.test(value),
          to: (value) => typeof value === 'string' && VERSION.test(value),
        },
        optional: true,
      },
    )
  )
    return;

  root.walkDecls((declaration) => {
    const reportName = (name, index, rewrite) => {
      const entry = deprecatedTokens.get(name);
      if (!entry || !inRange(entry.since, secondary)) return;
      const renamed = entry.kind === 'renamed';
      report({
        ruleName,
        result,
        node: declaration,
        index,
        endIndex: index + name.length,
        message: messages[entry.kind](
          name,
          entry.replacement,
          entry.since,
          entry.itemId,
        ),
        fix: renamed ? () => rewrite(entry.replacement) : undefined,
      });
    };

    reportName(declaration.prop, 0, (replacement) => {
      declaration.prop = replacement;
    });

    const valueIndex =
      declaration.prop.length + (declaration.raws.between ?? ':').length;
    for (const match of declaration.value.matchAll(CUSTOM_PROPERTY))
      reportName(match[0], valueIndex + match.index, (replacement) => {
        declaration.value = declaration.value.replace(
          new RegExp(`(?<![\\w-])${match[0]}(?![\\w-])`, 'g'),
          replacement,
        );
      });
  });
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = {
  url: 'https://www.npmjs.com/package/@ids-group-ltd/ids-design-system',
  fixable: true,
};

export default createPlugin(ruleName, rule);
