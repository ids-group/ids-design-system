#!/usr/bin/env node
// The upload tree, in the one order that produces a complete one: build-cards wipes the directory
// it owns and does not write the adherence config, so running it second would delete that file.
// Both the release hook and the pipeline go through here, so the order lives in exactly one place.
//
//   node .design-sync/tools/build-upload.mjs      # after gen.mjs -> ng build -> build-bundle.mjs
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// build-manifest reads each card's own `@dsCard` marker, so it runs after build-cards wrote them —
// which is what keeps the pane's index from disagreeing with the pages it indexes.
// build-thumbnail is NOT here: it needs a browser, and this runs in a pipeline that has none. The
// cover image changes only when the card it is shot from does, so it is a local step like
// measure-cards — CI checks the file exists rather than re-rendering it.
const here = dirname(fileURLToPath(import.meta.url));
for (const tool of ['build-cards.mjs', 'build-adherence.mjs', 'build-manifest.mjs']) {
  execFileSync(process.execPath, [join(here, tool)], { stdio: 'inherit' });
}
