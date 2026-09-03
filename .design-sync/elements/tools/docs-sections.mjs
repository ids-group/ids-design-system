// The ds-docs showcase, read as data. `GROUP_PAGES` is the list ds-docs itself routes off, so it
// is the one place a new section gets registered — reading it means a section added to the docs
// site appears on its Claude Design card with no second registration to keep in step.
//
// The slug is derived from the FILE path, not from the exported class name: two sections legitimately
// share a name (`FilterBarSection` exists under both components/ and patterns/) and reach GROUP_PAGES
// through an import alias, which is a property of that one import statement and not of the section.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..', '..');
const ts = createRequire(join(repo, 'package.json'))('typescript');

const REGISTRY_FILE = join(repo, 'ds-docs', 'src', 'app', 'group-pages.ts');

const slugOf = (importPath) =>
  importPath.replace(/^\.\/sections\//, '').replace(/\/[^/]+$/, '');

const pascalOf = (slug) =>
  slug
    .split(/[/-]/)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');

function stringOf(node) {
  if (!node || !ts.isStringLiteralLike(node)) return null;
  return node.text;
}

// Pages of the docs SITE rather than content of the design system, so nothing in Claude Design has
// a use for them and registering them only grows the bundle every card downloads. `reference` is the
// generated token table (~800 rows), `changelog` reads a shipped markdown file, `home` is the hero,
// and `claude-design` documents this pipeline to a human.
const NOT_DESIGN_SYSTEM = new Set(['home', 'changelog', 'tokens-reference', 'practice/claude-design']);

/** Every section ds-docs renders, in the order the docs site renders them. */
export function docsSections() {
  const source = ts.createSourceFile(
    REGISTRY_FILE,
    readFileSync(REGISTRY_FILE, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );

  // Local name → { exportedName, importPath }. The local name is what GROUP_PAGES refers to, and it
  // differs from the exported one wherever an alias disambiguates two same-named sections.
  const imports = new Map();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const importPath = stringOf(statement.moduleSpecifier);
    const bindings = statement.importClause?.namedBindings;
    if (!importPath || !bindings || !ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      imports.set(element.name.text, {
        exportedName: (element.propertyName ?? element.name).text,
        importPath,
      });
    }
  }

  const groupPages = source.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => statement.declarationList.declarations)
    .find((declaration) => declaration.name.getText() === 'GROUP_PAGES')?.initializer;
  if (!groupPages) throw new Error(`No GROUP_PAGES in ${REGISTRY_FILE}`);

  // `as const` / `as readonly …` wrap the array literal.
  const array = ts.isAsExpression(groupPages) ? groupPages.expression : groupPages;
  if (!ts.isArrayLiteralExpression(array)) {
    throw new Error('GROUP_PAGES is not an array literal — the parser reads it as data.');
  }

  const sections = [];
  const seen = new Set();
  for (const page of array.elements) {
    if (!ts.isObjectLiteralExpression(page)) continue;
    const property = (name) =>
      page.properties.find(
        (candidate) => ts.isPropertyAssignment(candidate) && candidate.name.getText() === name,
      )?.initializer;

    const group = stringOf(property('path'));
    if (group === null) continue;
    const title = stringOf(property('title')) ?? '';
    const list = property('sections');
    if (!list || !ts.isArrayLiteralExpression(list)) continue;

    for (const entry of list.elements) {
      if (!ts.isIdentifier(entry)) continue;
      const imported = imports.get(entry.text);
      if (!imported) throw new Error(`GROUP_PAGES names ${entry.text}, which nothing imports.`);

      const slug = slugOf(imported.importPath);
      if (seen.has(slug) || NOT_DESIGN_SYSTEM.has(slug)) continue;
      seen.add(slug);

      sections.push({
        slug,
        tag: `ds-docs-${slug.replace(/\//g, '-')}`,
        group,
        title,
        exportedName: imported.exportedName,
        // Unique by construction, so two same-named exports can be imported side by side.
        localName: `Docs${pascalOf(slug)}`,
        importPath: `../../../ds-docs/src/app/${imported.importPath.replace(/^\.\//, '')}`,
      });
    }
  }

  return sections;
}
