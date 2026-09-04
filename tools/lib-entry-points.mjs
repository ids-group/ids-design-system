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
export const PACKAGE_NAME = JSON.parse(
  readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'),
).name;

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
