// Since the library ships one entry point per component, a re-export inside `src/lib`
// can be written two ways: relative, when it stays inside one entry point, and as a
// package specifier, when it crosses into another. Every tool that walks the export
// graph has to follow both, so the resolution lives here once.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve } from 'node:path';

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const LIB_ROOT = join(REPO_ROOT, 'src', 'lib');
export const FACADE = join(LIB_ROOT, 'public-api.ts');
export const PRIMARY_NG_PACKAGE = join(LIB_ROOT, 'ng-package.json');
export const PACKAGE_NAME = JSON.parse(
  readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'),
).name;

// Every consumer of this module walks the export graph FROM the facade, and each of them treated
// its absence as "no public symbols" — which reads as a clean bill of health rather than as a
// failure, so the checks built on it would go quiet instead of red. The facade has already moved
// once (out of `src/` into `src/lib/` when the entry points landed), so this is not hypothetical.
if (!existsSync(FACADE)) {
  console.error(
    `lib-entry-points: ${relative(REPO_ROOT, FACADE).split('\\').join('/')} does not exist, so ` +
      'the public surface cannot be resolved. Every check that walks it would pass on an empty ' +
      'set. If the primary entry point moved, point FACADE at its new entryFile.',
  );
  process.exit(1);
}

const asFile = (base) => {
  for (const candidate of [`${base}.ts`, `${base}.d.ts`, join(base, 'index.ts')]) {
    if (existsSync(candidate)) return candidate;
  }

  return null;
};

/** The .ts file a specifier names, whether it is relative or `<package>/<entry point>`. */
export function resolveLibSpecifier(fromFile, specifier) {
  if (specifier === PACKAGE_NAME) return FACADE;
  if (specifier.startsWith(`${PACKAGE_NAME}/`)) {
    return asFile(join(LIB_ROOT, specifier.slice(PACKAGE_NAME.length + 1)));
  }
  if (!specifier.startsWith('.')) return null;

  return asFile(resolve(dirname(fromFile), specifier));
}

/** Every entry point, found the way ng-packagr finds them: by its ng-package.json. */
export function entryPoints() {
  const found = [];
  const crawl = (dir) => {
    if (existsSync(join(dir, 'ng-package.json')) && dir !== LIB_ROOT) {
      found.push({
        moduleId: `${PACKAGE_NAME}/${relative(LIB_ROOT, dir).split('\\').join('/')}`,
        directory: dir,
        index: join(dir, 'index.ts'),
      });
    }
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      if (item.isDirectory()) crawl(join(dir, item.name));
    }
  };
  crawl(LIB_ROOT);

  return found.sort((a, b) => a.moduleId.localeCompare(b.moduleId));
}

/** Names carrying an `@internal` tag. An entry point has to export whatever another entry
 *  point imports, so some helpers are reachable that no consumer should build on; the tag
 *  is what keeps them out of the reference and the design-sync contracts. It does NOT strip
 *  them from the .d.ts — the imports that forced the export still need them. */
export function internalSymbols() {
  const marked = new Set();
  const TAGGED = /\/\*\*[\s\S]*?@internal[\s\S]*?\*\/\s*(?:@[\w.]+\([\s\S]*?\)\s*)*export\s+(?:declare\s+)?(?:abstract\s+)?(?:class|const|function|interface|type|enum)\s+(\w+)/g;
  const visit = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, item.name);
      if (item.isDirectory()) {
        visit(full);
        continue;
      }
      if (!item.name.endsWith('.ts') || item.name.endsWith('.spec.ts')) continue;
      for (const [, name] of readFileSync(full, 'utf8').matchAll(TAGGED)) marked.add(name);
    }
  };
  visit(LIB_ROOT);

  return marked;
}
