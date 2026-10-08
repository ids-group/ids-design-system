#!/usr/bin/env node
// The public surface as committed text: one `goldens/public-api/<entry point>.api.md` per
// ng-package entry point, changed in the same commit as the source, so a surface change reaches a
// reviewer and the changelog tools as a plain diff.
//
// Each golden lists every symbol its entry file exports. A symbol declared in another entry point is
// one `export { X } from '<module>'` line with its kind, so a name is spelled out once, where it
// lives. A class lists every member with its visibility; a private member by name only, because
// only its name can collide in a subclass. Signal inputs, models and outputs keep their whole
// initializer, which carries the type and the default. Other initializers are cut to the call
// (`computed<T>(…)`) or the arrow's signature, since their bodies are implementation. Then the
// `--ds-*` hooks each component's stylesheet and class read, with every fallback.
//
// Parsed with the TypeScript parser alone, no type-checker, so an inferred type is shown as its
// source expression rather than resolved.
//
//   node tools/public-api-golden.mjs --write           # regenerate goldens/ from the working tree
//   node tools/public-api-golden.mjs --check           # exit 1 and print the diff when stale
//   node tools/public-api-golden.mjs --diff v0.14.5    # golden diff, ref..working tree
//   node tools/public-api-golden.mjs --diff v0.14.5 v0.15.0
import ts from 'typescript';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readTreeAt } from './check-manifest-truth.mjs';
import { hookReads, withoutComments } from './check-changelog-pending.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE_NAME = JSON.parse(
  readFileSync(join(ROOT, 'package.json'), 'utf8'),
).name;
const LIB = 'src/lib';
// Overridable so the selftest can check a copy without writing into the checkout.
export const GOLDEN_DIR =
  process.env.DS_GOLDEN_DIR ?? join(ROOT, 'goldens/public-api');

const keepFile = (path) =>
  (/\.(ts|scss)$/.test(path) && !path.endsWith('.spec.ts')) ||
  path.endsWith('/ng-package.json');

// Tracked and untracked-but-not-ignored, the set a commit of the working tree would hold.
export function workingTreeFiles() {
  return execFileSync(
    'git',
    ['-C', ROOT, 'ls-files', '-co', '--exclude-standard', '--', LIB],
    { encoding: 'utf8', maxBuffer: 1 << 26 },
  )
    .split('\n')
    .filter((path) => path && keepFile(path))
    .flatMap((path) => {
      try {
        return [{ path, text: readFileSync(join(ROOT, path), 'utf8') }];
      } catch {
        // Listed by the index but deleted on disk.
        return [];
      }
    });
}

export function filesAt(ref) {
  const files = readTreeAt(ref, [LIB], keepFile);
  // An empty side would print an empty diff, which reads as "nothing changed".
  if (!files?.some(({ path }) => path === `${LIB}/ng-package.json`))
    throw new Error(`public-api-golden: no ${LIB}/ng-package.json at ${ref}`);
  return files;
}

const printer = ts.createPrinter({ removeComments: true });
// A trailing comma comes and goes with prettier's line wrapping, so it is not part of the surface.
const oneLine = (text) =>
  text.replace(/\s*\n\s*/g, ' ').replace(/,(\s*[}\])])/g, '$1');

const SIGNAL_API =
  /^(?:input|model|output|outputFromObservable)(?:\.required)?$/;

const hasModifier = (node, kind) =>
  (ts.getModifiers(node) ?? []).some((modifier) => modifier.kind === kind);

const decoratorCall = (node) =>
  (ts.getDecorators(node) ?? [])
    .map((decorator) => decorator.expression)
    .find(ts.isCallExpression);

// Only the keys that change how a consumer reaches the class: its tag, its template reference
// name, where it is provided.
function angularHeader(node, sourceFile) {
  const call = decoratorCall(node);
  if (!call) return null;
  const name = call.expression.getText(sourceFile);
  const options = call.arguments[0];
  const kept = [];
  if (options && ts.isObjectLiteralExpression(options))
    for (const property of options.properties)
      if (
        ts.isPropertyAssignment(property) &&
        ['selector', 'exportAs', 'providedIn'].includes(
          property.name.getText(sourceFile),
        )
      )
        kept.push(oneLine(property.getText(sourceFile)));
  return `@${name}(${kept.length ? `{ ${kept.join(', ')} }` : ''})`;
}

export function selectorOf(node, sourceFile) {
  const options = decoratorCall(node)?.arguments[0];
  if (!options || !ts.isObjectLiteralExpression(options)) return null;
  const selector = options.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) &&
      property.name.getText(sourceFile) === 'selector',
  );
  return selector && ts.isStringLiteralLike(selector.initializer)
    ? selector.initializer.text
    : null;
}

function visibilityPrefix(member) {
  const words = [
    hasModifier(member, ts.SyntaxKind.PrivateKeyword)
      ? 'private'
      : hasModifier(member, ts.SyntaxKind.ProtectedKeyword)
        ? 'protected'
        : 'public',
  ];
  for (const [kind, word] of [
    [ts.SyntaxKind.StaticKeyword, 'static'],
    [ts.SyntaxKind.AbstractKeyword, 'abstract'],
    [ts.SyntaxKind.OverrideKeyword, 'override'],
    [ts.SyntaxKind.ReadonlyKeyword, 'readonly'],
  ])
    if (hasModifier(member, kind)) words.push(word);
  return words.join(' ');
}

const ELLIPSIS = ts.factory.createIdentifier('…');

function shownInitializer(initializer, sourceFile) {
  if (!initializer) return undefined;
  if (ts.isCallExpression(initializer)) {
    if (SIGNAL_API.test(initializer.expression.getText(sourceFile)))
      return initializer;
    return ts.factory.createCallExpression(
      initializer.expression,
      initializer.typeArguments,
      [ELLIPSIS],
    );
  }
  if (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
    return ts.factory.createArrowFunction(
      undefined,
      initializer.typeParameters,
      initializer.parameters,
      initializer.type,
      undefined,
      ELLIPSIS,
    );
  return initializer;
}

const print = (node, sourceFile) =>
  printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);

function memberLine(member, sourceFile) {
  if (
    ts.isClassStaticBlockDeclaration(member) ||
    ts.isSemicolonClassElement(member)
  )
    return null;
  if (member.name && ts.isPrivateIdentifier(member.name)) return null;
  const prefix = visibilityPrefix(member);
  const name = member.name ? member.name.getText(sourceFile) : '';
  if (prefix.startsWith('private'))
    return `${prefix} ${ts.isConstructorDeclaration(member) ? 'constructor' : name};`;

  const factory = ts.factory;
  let core;
  if (ts.isPropertyDeclaration(member))
    core = factory.createPropertyDeclaration(
      undefined,
      member.name,
      member.questionToken ?? member.exclamationToken,
      member.type,
      shownInitializer(member.initializer, sourceFile),
    );
  else if (ts.isMethodDeclaration(member))
    core = factory.createMethodDeclaration(
      undefined,
      member.asteriskToken,
      member.name,
      member.questionToken,
      member.typeParameters,
      member.parameters,
      member.type,
      undefined,
    );
  else if (ts.isConstructorDeclaration(member))
    core = factory.createConstructorDeclaration(
      undefined,
      member.parameters,
      undefined,
    );
  else if (ts.isGetAccessorDeclaration(member))
    core = factory.createGetAccessorDeclaration(
      undefined,
      member.name,
      member.parameters,
      member.type,
      undefined,
    );
  else if (ts.isSetAccessorDeclaration(member))
    core = factory.createSetAccessorDeclaration(
      undefined,
      member.name,
      member.parameters,
      undefined,
    );
  else core = member;
  let text = oneLine(print(core, sourceFile)).trim();
  if (!text.endsWith(';')) text += ';';
  return `${prefix} ${text}`;
}

const memberSortKey = (member, sourceFile) =>
  ts.isConstructorDeclaration(member)
    ? ''
    : (member.name?.getText(sourceFile) ?? '');

function renderClass(node, sourceFile) {
  const lines = [];
  const header = angularHeader(node, sourceFile);
  if (header) lines.push(header);
  const heritage = (node.heritageClauses ?? [])
    .map((clause) => oneLine(clause.getText(sourceFile)))
    .join(' ');
  const typeParameters = node.typeParameters
    ? `<${node.typeParameters.map((parameter) => oneLine(parameter.getText(sourceFile))).join(', ')}>`
    : '';
  const abstract = hasModifier(node, ts.SyntaxKind.AbstractKeyword)
    ? 'abstract '
    : '';
  lines.push(
    `export ${abstract}class ${node.name.text}${typeParameters}${heritage ? ` ${heritage}` : ''} {`,
  );
  // Ordered by name, overloads keeping their source order, so moving a member is not a change.
  const members = node.members
    .map((member, index) => ({
      key: memberSortKey(member, sourceFile),
      index,
      line: memberLine(member, sourceFile),
    }))
    .filter((entry) => entry.line)
    .sort((a, b) =>
      a.key < b.key ? -1 : a.key > b.key ? 1 : a.index - b.index,
    );
  for (const { line } of members) lines.push(`    ${line}`);
  lines.push('}');
  return lines.join('\n');
}

function renderFunction(nodes, sourceFile) {
  // With overloads, the implementation signature is not callable from outside.
  const signatures =
    nodes.length > 1 ? nodes.filter((node) => !node.body) : nodes;
  return signatures
    .map((node) =>
      oneLine(
        print(
          ts.factory.updateFunctionDeclaration(
            node,
            ts
              .getModifiers(node)
              ?.filter(
                (modifier) => modifier.kind !== ts.SyntaxKind.AsyncKeyword,
              ),
            node.asteriskToken,
            node.name,
            node.typeParameters,
            node.parameters,
            node.type,
            undefined,
          ),
          sourceFile,
        ),
      ).replace(/;?$/, ';'),
    )
    .join('\n');
}

const KIND_OF = (node, sourceFile) => {
  if (ts.isClassDeclaration(node)) {
    const decorator = decoratorCall(node)?.expression.getText(sourceFile);
    return decorator
      ? decorator.toLowerCase()
      : hasModifier(node, ts.SyntaxKind.AbstractKeyword)
        ? 'abstract class'
        : 'class';
  }
  if (ts.isFunctionDeclaration(node)) return 'function';
  if (ts.isInterfaceDeclaration(node)) return 'interface';
  if (ts.isTypeAliasDeclaration(node)) return 'type';
  if (ts.isEnumDeclaration(node)) return 'enum';
  if (ts.isVariableStatement(node))
    return node.declarationList.flags & ts.NodeFlags.Const ? 'const' : 'let';
  return ts.SyntaxKind[node.kind];
};

function renderDeclaration({ nodes, sourceFile, name }) {
  const [node] = nodes;
  if (ts.isClassDeclaration(node)) return renderClass(node, sourceFile);
  if (ts.isFunctionDeclaration(node)) return renderFunction(nodes, sourceFile);
  if (ts.isVariableStatement(node)) {
    const declaration = node.declarationList.declarations.find(
      (candidate) => candidate.name.getText(sourceFile) === name,
    );
    const keyword =
      node.declarationList.flags & ts.NodeFlags.Const ? 'const' : 'let';
    const shown = ts.factory.createVariableDeclaration(
      declaration.name,
      declaration.exclamationToken,
      declaration.type,
      declaration.type
        ? undefined
        : shownInitializer(declaration.initializer, sourceFile),
    );
    return `export ${keyword} ${print(shown, sourceFile)};`;
  }
  return print(node, sourceFile);
}

export function renderGoldens(files) {
  const text = new Map(files.map(({ path, text: content }) => [path, content]));
  const parsed = new Map();
  const sourceOf = (path) => {
    if (!parsed.has(path))
      parsed.set(
        path,
        ts.createSourceFile(path, text.get(path), ts.ScriptTarget.Latest, true),
      );
    return parsed.get(path);
  };

  const entries = files
    .filter(({ path }) => path.endsWith('/ng-package.json'))
    .map(({ path, text: json }) => {
      const directory = posix.dirname(path);
      const subpath = posix.relative(LIB, directory);
      let entryFile = 'index.ts';
      try {
        entryFile = JSON.parse(json).lib?.entryFile ?? entryFile;
      } catch {
        // A malformed ng-package.json fails the build anyway; the default keeps the golden readable.
      }
      return {
        directory,
        moduleId: subpath ? `${PACKAGE_NAME}/${subpath}` : PACKAGE_NAME,
        golden: subpath ? `${subpath}.api.md` : 'index.api.md',
        entryFile: posix.join(directory, entryFile),
      };
    })
    .sort((a, b) => (a.golden < b.golden ? -1 : 1));
  const byDepth = [...entries].sort(
    (a, b) => b.directory.length - a.directory.length,
  );
  const owners = new Map(
    files.map(({ path }) => [
      path,
      byDepth.find((entry) => path.startsWith(`${entry.directory}/`)),
    ]),
  );
  const ownerOf = (path) => owners.get(path);

  const asFile = (base) =>
    [`${base}.ts`, `${base}/index.ts`, base].find(
      (candidate) => candidate.endsWith('.ts') && text.has(candidate),
    );
  const resolve = (fromPath, specifier) => {
    if (
      specifier === PACKAGE_NAME ||
      specifier.startsWith(`${PACKAGE_NAME}/`)
    ) {
      const directory = posix.join(
        LIB,
        specifier.slice(PACKAGE_NAME.length + 1),
      );
      return (
        entries.find((entry) => entry.directory === directory)?.entryFile ??
        asFile(directory)
      );
    }
    if (!specifier.startsWith('.')) return null;
    return asFile(posix.join(posix.dirname(fromPath), specifier));
  };

  // Follows `export { X } from` chains to the statement that declares X.
  const declarationOf = (path, name, seen = new Set()) => {
    if (!path || seen.has(`${path}#${name}`)) return null;
    seen.add(`${path}#${name}`);
    const sourceFile = sourceOf(path);
    const nodes = [];
    for (const statement of sourceFile.statements) {
      if (ts.isExportDeclaration(statement)) {
        if (!statement.exportClause) {
          throw new Error(
            `public-api-golden: \`export *\` in ${path} is not supported; list the names.`,
          );
        }
        for (const element of statement.exportClause.elements ?? [])
          if (element.name.text === name) {
            const original = (element.propertyName ?? element.name).text;
            return statement.moduleSpecifier
              ? declarationOf(
                  resolve(path, statement.moduleSpecifier.text),
                  original,
                  seen,
                )
              : declarationOf(path, original, seen);
          }
        continue;
      }
      const declaredName = ts.isVariableStatement(statement)
        ? statement.declarationList.declarations.some(
            (declaration) => declaration.name.getText(sourceFile) === name,
          ) && name
        : statement.name?.text;
      if (declaredName === name && !ts.isImportDeclaration(statement))
        nodes.push(statement);
    }
    if (nodes.length) return { nodes, sourceFile, name, path };
    // `import { X } from '…'; export { X };`
    for (const statement of sourceFile.statements)
      if (ts.isImportDeclaration(statement))
        for (const element of statement.importClause?.namedBindings?.elements ??
          [])
          if (element.name.text === name)
            return declarationOf(
              resolve(path, statement.moduleSpecifier.text),
              (element.propertyName ?? element.name).text,
              seen,
            );
    return null;
  };

  const exportedNames = (path) => {
    const names = new Set();
    for (const statement of sourceOf(path).statements) {
      if (ts.isExportDeclaration(statement) && statement.exportClause)
        for (const element of statement.exportClause.elements ?? [])
          names.add(element.name.text);
      else if (
        hasModifier(statement, ts.SyntaxKind.ExportKeyword) &&
        !hasModifier(statement, ts.SyntaxKind.DefaultKeyword)
      ) {
        if (ts.isVariableStatement(statement))
          for (const declaration of statement.declarationList.declarations)
            names.add(declaration.name.getText(sourceOf(path)));
        else if (statement.name) names.add(statement.name.text);
      }
      if (ts.isExportDeclaration(statement) && !statement.exportClause)
        throw new Error(
          `public-api-golden: \`export *\` in ${path} is not supported; list the names.`,
        );
    }
    return [...names].sort();
  };

  // Which component a stylesheet belongs to, so its hooks are filed under the element.
  const selectorByFile = new Map();
  for (const { path } of files) {
    if (!path.endsWith('.ts')) continue;
    if (!/@(Component|Directive)\(/.test(text.get(path))) continue;
    const sourceFile = sourceOf(path);
    for (const statement of sourceFile.statements) {
      if (!ts.isClassDeclaration(statement)) continue;
      const selector = selectorOf(statement, sourceFile);
      const options = decoratorCall(statement)?.arguments[0];
      if (!selector || !options || !ts.isObjectLiteralExpression(options))
        continue;
      selectorByFile.set(path, selector);
      for (const property of options.properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const key = property.name.getText(sourceFile);
        const urls =
          key === 'styleUrl'
            ? [property.initializer]
            : key === 'styleUrls' &&
                ts.isArrayLiteralExpression(property.initializer)
              ? property.initializer.elements
              : [];
        for (const url of urls)
          if (ts.isStringLiteralLike(url))
            selectorByFile.set(
              posix.join(posix.dirname(path), url.text),
              selector,
            );
      }
    }
  }

  const goldens = new Map();
  for (const entry of entries) {
    if (!text.has(entry.entryFile)) continue;
    const declarations = [];
    const reexports = [];
    for (const name of exportedNames(entry.entryFile)) {
      const found = declarationOf(entry.entryFile, name);
      if (!found) {
        reexports.push(`export { ${name} }; // unresolved`);
        continue;
      }
      const internal = /@internal\b/.test(
        ts
          .getLeadingCommentRanges(found.sourceFile.text, found.nodes[0].pos)
          ?.map((range) => found.sourceFile.text.slice(range.pos, range.end))
          .join('\n') ?? '',
      )
        ? ' @internal'
        : '';
      const owner = ownerOf(found.path);
      if (owner && owner !== entry)
        reexports.push(
          `export { ${name} } from '${owner.moduleId}'; // ${KIND_OF(found.nodes[0], found.sourceFile)}${internal}`,
        );
      else
        declarations.push(
          `${internal ? `// ${internal.trim()}\n` : ''}${renderDeclaration(found)}`,
        );
    }

    const hooks = new Map();
    for (const [path, owner] of owners) {
      if (owner !== entry || path.endsWith('.json')) continue;
      for (const [hook, fallback] of hookReads(
        withoutComments(text.get(path)),
      )) {
        const group = selectorByFile.get(path) ?? posix.relative(LIB, path);
        if (!hooks.has(group)) hooks.set(group, new Map());
        if (!hooks.get(group).has(hook)) hooks.get(group).set(hook, new Set());
        hooks
          .get(group)
          .get(hook)
          .add(fallback || '(none)');
      }
    }

    const sections = [
      `## API Report File for "${entry.moduleId}"`,
      '',
      '> Generated by `node tools/public-api-golden.mjs --write`. Do not edit.',
      '',
      '```ts',
      [
        ...reexports,
        ...(reexports.length && declarations.length ? [''] : []),
        declarations.join('\n\n'),
      ]
        .join('\n')
        .trimEnd(),
      '```',
    ];
    if (hooks.size) {
      sections.push('', '## CSS hooks', '', '```css');
      const groups = [...hooks.keys()].sort();
      groups.forEach((group, index) => {
        if (index) sections.push('');
        sections.push(`${group} {`);
        for (const hook of [...hooks.get(group).keys()].sort())
          sections.push(
            `    ${hook}: ${[...hooks.get(group).get(hook)].sort().join(' | ')};`,
          );
        sections.push('}');
      });
      sections.push('```');
    }
    goldens.set(entry.golden, `${sections.join('\n')}\n`);
  }
  return goldens;
}

function writeTree(directory, goldens) {
  rmSync(directory, { recursive: true, force: true });
  for (const [name, content] of goldens) {
    mkdirSync(dirname(join(directory, name)), { recursive: true });
    writeFileSync(join(directory, name), content);
  }
}

function readTree(directory) {
  const found = new Map();
  const crawl = (at, prefix) => {
    let items;
    try {
      items = readdirSync(at, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of items) {
      if (item.isDirectory())
        crawl(join(at, item.name), `${prefix}${item.name}/`);
      else if (item.name.endsWith('.api.md'))
        found.set(
          `${prefix}${item.name}`,
          readFileSync(join(at, item.name), 'utf8').replace(/\r\n/g, '\n'),
        );
    }
  };
  crawl(directory, '');
  return found;
}

// `git diff --no-index` over two scratch trees named a/ and b/, so the output reads like any patch.
function diffTrees(before, after) {
  const scratch = mkdtempSync(join(tmpdir(), 'public-api-golden-'));
  try {
    writeTree(join(scratch, 'a'), before);
    writeTree(join(scratch, 'b'), after);
    return spawnSync(
      'git',
      [
        '-c',
        'core.autocrlf=false',
        'diff',
        '--no-index',
        '--no-prefix',
        '--no-color',
        'a',
        'b',
      ],
      { cwd: scratch, encoding: 'utf8', maxBuffer: 1 << 28 },
    ).stdout;
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

export function checkGoldens(directory = GOLDEN_DIR) {
  const expected = renderGoldens(workingTreeFiles());
  const committed = readTree(directory);
  const stale = [...new Set([...expected.keys(), ...committed.keys()])].filter(
    (name) => expected.get(name) !== committed.get(name),
  );
  if (!stale.length) {
    console.log(
      `public-api-golden: ${expected.size} golden(s) match the working tree.`,
    );
    return 0;
  }
  console.log(diffTrees(committed, expected));
  console.error(
    `public-api-golden: ${stale.length} golden(s) stale against the working tree:\n  ${stale.join('\n  ')}\n` +
      'Run `node tools/public-api-golden.mjs --write` and commit the goldens with the source.',
  );
  return 1;
}

function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === '--write') {
    const goldens = renderGoldens(workingTreeFiles());
    writeTree(GOLDEN_DIR, goldens);
    console.log(
      `public-api-golden: wrote ${goldens.size} golden(s) to ${GOLDEN_DIR}.`,
    );
    return 0;
  }
  if (argv[0] === '--check') return checkGoldens();
  if (argv[0] === '--diff' && argv[1] && argv.length <= 3) {
    const [, from, to] = argv;
    try {
      const before = renderGoldens(filesAt(from));
      const after = renderGoldens(to ? filesAt(to) : workingTreeFiles());
      process.stdout.write(diffTrees(before, after));
    } catch (error) {
      console.error(error.message);
      return 1;
    }
    return 0;
  }
  console.error(
    'public-api-golden: use --write, --check, or --diff <ref> [<ref>] (second ref defaults to the working tree).',
  );
  return 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href)
  process.exitCode = main();
