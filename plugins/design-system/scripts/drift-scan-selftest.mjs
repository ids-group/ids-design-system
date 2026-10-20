#!/usr/bin/env node
//   node drift-scan-selftest.mjs     # exit 0 = drift-scan still finds what it must, and only that
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = mkdtempSync(join(tmpdir(), 'drift-scan-'));
const put = (path, text) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
};
put(
  'old/a.scss',
  "@use 'chart-motion';\n@mixin sweeps-in($ring) {}\n@include chart-motion.sweeps-in('.ring');\n.gone-class { color: var(--ds-gone-token); width: math.div(1, 2); }\n.kept {}\n",
);
put('old/a.html', '<span class="markup-gone kept"></span>\n');
put('new/a.scss', '.kept {}\n');
put(
  'old/b.scss',
  '.html {}\n// see theme.comment-only\n/* and .block-only */\n',
);
put(
  'app/x.scss',
  '.gone-class {}\n.gone-classy {}\n.gone-class-y {}\n.markup-gone {}\n',
);
put(
  'app/y.ts',
  'const token = "--ds-gone-token"; const selector = ".gone-class";\n',
);
put('app/z.html', '<i style="color: var(--ds-gone-token-x)"></i>\n');
put(
  'app/c.scss',
  '// via <html data-brand="app"> (see index.html)\n/* .gone-class\n   index.html */\n.kept { background: url(index.html); content: "a.html"; }\n.html {}\n',
);
put('app/node_modules/n.scss', '.gone-class {}\n');

try {
  const script = join(
    dirname(fileURLToPath(import.meta.url)),
    'drift-scan.mjs',
  );
  const out = JSON.parse(
    execFileSync(
      'node',
      [script, join(root, 'old'), join(root, 'new'), join(root, 'app')],
      {
        encoding: 'utf8',
      },
    ),
  );
  assert.deepEqual(out.goneTokens, ['--ds-gone-token']);
  assert.deepEqual(out.goneClasses, ['gone-class', 'html', 'markup-gone']);
  assert.deepEqual(
    out.hits.map(
      (hit) =>
        `${hit.file.slice(root.length + 1).replace(/\\/g, '/')}:${hit.line} ${hit.name}`,
    ),
    [
      'app/c.scss:5 html',
      'app/x.scss:1 gone-class',
      'app/x.scss:4 markup-gone',
      'app/y.ts:1 --ds-gone-token',
    ],
  );
  console.log('drift-scan selftest: OK');
} finally {
  rmSync(root, { recursive: true, force: true });
}
