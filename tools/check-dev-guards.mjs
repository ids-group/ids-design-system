// Does every dev-only warning helper sit behind the inline `ngDevMode` guard?
//
// `devWarn` and `warnAnnounceOversight` check `isDevMode()` themselves, but that is a call a
// bundler cannot fold, so an unguarded call ships its message closures to production. The guard
// has to be the inline `typeof` form on the branch; `src/lib/core/build-flags.d.ts` says why.
//
//   node tools/check-dev-guards.mjs [root...]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

const GUARDED = new Set(['devWarn', 'warnAnnounceOversight']);
const GUARD = "typeof ngDevMode === 'undefined' || ngDevMode";

const ROOTS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['src/lib'];

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.ts') && !full.endsWith('.d.ts')) {
      files.push(full);
    }
  }
};
for (const root of ROOTS) walk(root);

const isGuarded = (node) => {
  for (
    let child = node, parent = node.parent;
    parent;
    child = parent, parent = parent.parent
  ) {
    if (
      ts.isIfStatement(parent) &&
      parent.thenStatement === child &&
      parent.expression.getText().replace(/\s+/g, ' ') === GUARD
    ) {
      return true;
    }
    if (ts.isFunctionDeclaration(parent) && GUARDED.has(parent.name?.text)) {
      return true;
    }
  }

  return false;
};

const findings = [];
let callCount = 0;

for (const file of files) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      GUARDED.has(node.expression.text)
    ) {
      callCount += 1;
      if (!isGuarded(node)) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart());
        findings.push(
          `${file.replace(/\\/g, '/')}:${line + 1}  ${node.expression.text}(`,
        );
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

if (!findings.length) {
  console.log(
    `check-dev-guards: OK - ${callCount} dev-warning call(s) across ${files.length} files sit behind the ngDevMode guard.`,
  );
  process.exit(0);
}

console.error(
  `check-dev-guards: a dev-warning call outside \`if (${GUARD})\` ships its message to production.\n`,
);
for (const finding of findings) console.error(`  ${finding}`);
process.exit(1);
