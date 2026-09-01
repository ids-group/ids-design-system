import { existsSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

/**
 * ng-packagr refuses a relative import that crosses an entry-point boundary, and the
 * failure it produces names nothing: `Cannot destructure property 'pos' of
 * 'file.referencedFiles[index]' as it is undefined`. It also catches `import type`, because
 * an erased import is still an entry-point dependency and fails the same way.
 *
 * Turned OFF until the per-component entry points land — see `docs/todo.md` → A3. It reports
 * every existing cross-folder import until then, which is the point: the count is the size of
 * that refactor.
 */

const LIB_ROOT = 'src' + sep + 'lib';

/** Folders whose imports of each other are fine because they share one entry point:
 *  two sibling pairs that are genuinely mutually dependent, and the four-way cycle the
 *  config's type imports create — accepted, because breaking it saves 593 B gzip. */
const DEFAULT_CO_LOCATED = [
  ['components/radio', 'components/radio-group'],
  ['components/time-columns', 'components/time-picker'],
  ['components/card', 'config', 'core', 'icons'],
];

function groupOf(absolutePath, libRoot) {
  const rel = relative(libRoot, absolutePath);
  if (rel.startsWith('..')) return null;
  const parts = rel.split(sep);
  if (parts.length === 1) return 'components-root';
  if (parts[0] === 'components' && parts.length > 2) {
    return 'components/' + parts[1];
  }
  if (parts[0] === 'components') return 'components-root';
  return parts[0];
}

function resolveSpecifier(fromFile, specifier) {
  const base = resolve(dirname(fromFile), specifier);
  for (const candidate of [
    base + '.ts',
    join(base, 'index.ts'),
    base + '.d.ts',
  ]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function publicSpecifier(group) {
  const slug = group.startsWith('components/')
    ? group.slice('components/'.length)
    : group;
  return `@ids-group-ltd/ids-design-system/${slug}`;
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Forbid a relative import that crosses an entry-point boundary inside the published library',
    },
    schema: [
      {
        type: 'object',
        properties: {
          coLocated: {
            type: 'array',
            items: { type: 'array', items: { type: 'string' } },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      crossesBoundary:
        'Relative import crosses the {{to}} entry-point boundary. Import from {{specifier}} instead — ng-packagr fails on this with an unrelated-looking TypeScript error.',
    },
  },

  create(context) {
    const filename = context.filename;
    const libRoot = (() => {
      const index = filename.lastIndexOf(LIB_ROOT);
      return index < 0 ? null : filename.slice(0, index + LIB_ROOT.length);
    })();
    if (libRoot === null) return {};

    const from = groupOf(filename, libRoot);
    if (from === null) return {};

    const coLocated = (context.options[0]?.coLocated ?? DEFAULT_CO_LOCATED).map(
      (set) => new Set(set),
    );
    const shareEntryPoint = (a, b) =>
      coLocated.some((set) => set.has(a) && set.has(b));

    function check(node) {
      const specifier = node.source?.value;
      if (typeof specifier !== 'string' || !specifier.startsWith('.')) return;
      const target = resolveSpecifier(filename, specifier);
      if (target === null) return;
      const to = groupOf(target, libRoot);
      if (to === null || to === from || shareEntryPoint(from, to)) return;
      context.report({
        node: node.source,
        messageId: 'crossesBoundary',
        data: { to, specifier: publicSpecifier(to) },
      });
    }

    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
    };
  },
};
