// Post-build cleanup for the published library package.json.
//
// ng-packagr strips `scripts` and `devDependencies` from dist/ds/package.json,
// but leaves arbitrary top-level keys verbatim — so repo-only tooling config
// (e.g. the `simple-git-hooks` block) would otherwise leak into the published
// package. It's inert for consumers (no script runs it), but it's cruft. Drop
// the known dev-only keys here, right after `ng build ds`.
import { readFile, writeFile } from 'node:fs/promises';

const PKG = 'dist/ds/package.json';
const DROP_KEYS = ['simple-git-hooks'];

const pkg = JSON.parse(await readFile(PKG, 'utf8'));
const removed = DROP_KEYS.filter((key) => {
  const present = key in pkg;
  delete pkg[key];
  return present;
});

await writeFile(PKG, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log(removed.length ? `dist/ds: stripped ${removed.join(', ')}` : 'dist/ds: no dev-only keys to strip');
