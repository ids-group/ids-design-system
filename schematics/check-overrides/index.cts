import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import {
  findDeadClasses,
  findWriteOnlyBoundTokens,
  findWriteOnlyTokens,
} from './scan.cjs';

// No @types/node in this tsconfig (schematics/tsconfig.json has no `types`), so the two CommonJS
// globals this file needs are declared locally rather than pulling in a dependency for them.
declare function require(id: string): unknown;

interface CheckOverridesSchema {
  strict?: boolean;
  path?: string;
}

interface OverrideSurface {
  version: string;
  tokens: string[];
  classes: Record<string, string[]>;
}

const STYLE_FILE = /\.(scss|css|sass|less)$/;
const TOKEN_ONLY_FILE = /\.(html|ts)$/;
const SKIPPED_DIR = /\/(node_modules|dist|\.angular)\//;

/**
 * `ng g @ids-group-ltd/ids-design-system:check-overrides` — reports every `--ds-*` a consumer's
 * stylesheets set that the installed version never reads, and every `ds-*` selector naming a class
 * its components do not render. Read-only: it changes no file.
 */
export function checkOverrides(options: CheckOverridesSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const surface = require('./surface.json') as OverrideSurface;
    const readTokens = new Set(surface.tokens);
    let tokenHits = 0;
    let classHits = 0;

    tree.getDir(options.path ?? '/').visit((path, entry) => {
      if (SKIPPED_DIR.test(`${path}/`) || !entry) return;
      const isStyleFile = STYLE_FILE.test(path);
      const isTokenOnlyFile = !isStyleFile && TOKEN_ONLY_FILE.test(path);
      if (!isStyleFile && !isTokenOnlyFile) return;

      const content = entry.content.toString('utf8');
      const tokenHitsInFile = isStyleFile
        ? findWriteOnlyTokens(content, readTokens)
        : findWriteOnlyBoundTokens(content, readTokens);

      for (const hit of tokenHitsInFile) {
        context.logger.warn(
          `${path}:${hit.line} ${hit.token} is not read by @ids-group-ltd/ids-design-system ${surface.version}`,
        );
        tokenHits++;
      }

      if (isStyleFile) {
        for (const hit of findDeadClasses(content, surface.classes)) {
          context.logger.warn(
            `${path}:${hit.line} ${hit.selector} .${hit.className}: ${hit.selector} renders no such class in ${surface.version}`,
          );
          classHits++;
        }
      }
    });

    const summary = `check-overrides: ${tokenHits} write-only token(s), ${classHits} dead class(es)`;
    context.logger.info(summary);
    if (options.strict && tokenHits + classHits > 0) {
      throw new SchematicsException(summary);
    }

    return tree;
  };
}
