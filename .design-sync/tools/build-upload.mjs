#!/usr/bin/env node
// The upload tree, in the one order that produces a complete one: build-cards wipes the directory
// it owns and does not write the adherence config, so running it second would delete that file.
// Both the release hook and the pipeline go through here, so the order lives in exactly one place.
//
//   node .design-sync/tools/build-upload.mjs      # after gen.mjs -> ng build -> build-bundle.mjs
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
for (const tool of ['build-cards.mjs', 'build-adherence.mjs']) {
  execFileSync(process.execPath, [join(here, tool)], { stdio: 'inherit' });
}
