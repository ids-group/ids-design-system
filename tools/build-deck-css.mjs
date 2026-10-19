#!/usr/bin/env node
// Compiles the token stylesheet into decks/ds.css AND copies the font files
// it references. The copy is not a convenience: ds.css carries the library's
// @font-face rules with source-relative `url('./fonts/*.woff2')`, so without the
// files beside it every deck falls back to a substitute face — which corrupts any
// deck that judges type, and shifts the metrics of the rest.
//
// The url() check catches a `@font-face` added to _fonts.scss whose .woff2 never
// reached src/lib/styles/fonts — it cannot catch a missing copy, because the copy
// happens two lines above it.

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'src/lib/styles/ds.scss');
const TARGET = join(ROOT, 'decks/ds.css');
const FONTS_FROM = join(ROOT, 'src/lib/styles/fonts');
const FONTS_TO = join(ROOT, 'decks/fonts');

// The JS API, not the `sass` CLI: Node refuses to spawn a .cmd shim on Windows
// without a shell, and this needs no subprocess at all.
mkdirSync(dirname(TARGET), { recursive: true });
writeFileSync(TARGET, sass.compile(SOURCE, { style: 'expanded' }).css, 'utf8');

rmSync(FONTS_TO, { recursive: true, force: true });
mkdirSync(FONTS_TO, { recursive: true });
cpSync(FONTS_FROM, FONTS_TO, { recursive: true });

const css = readFileSync(TARGET, 'utf8');
const referenced = [...css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)]
  .map((match) => match[2])
  .filter((href) => !href.startsWith('data:') && !/^https?:/.test(href));

const missing = [...new Set(referenced)].filter(
  (href) => !existsSync(resolve(dirname(TARGET), href)),
);

if (missing.length > 0) {
  for (const href of missing)
    console.error(
      `build:deck-css: ERROR  ds.css references ${href}, which is not next to it`,
    );
  process.exit(1);
}

console.log(
  `build:deck-css: decks/ds.css written, ${referenced.length} referenced file(s) all present`,
);
