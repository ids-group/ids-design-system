#!/usr/bin/env node
// Fails when a committed golden under goldens/public-api differs from the one the working tree
// renders, or one is missing or left over, and prints the diff. The golden is the public surface a
// reviewer reads, so it changes in the same commit as the source. Generator and format:
// tools/public-api-golden.mjs.
//
//   node tools/check-public-api-golden.mjs
import { checkGoldens } from './public-api-golden.mjs';

process.exitCode = checkGoldens();
