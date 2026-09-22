import { check, finish } from './probe-check.mjs';
import { filesToAdd } from '../../src/lib/components/dropzone/dropzone.files.ts';

const named = (count) =>
  Array.from({ length: count }, (_unused, index) => ({
    name: `f${index}.png`,
  }));

check('one file in, one file out', filesToAdd(named(1), false).length, 1);
check(
  'three dropped on a single-file zone yield one',
  filesToAdd(named(3), false).length,
  1,
);
check(
  'the one kept is the first',
  filesToAdd(named(3), false)[0].name,
  'f0.png',
);
check(
  'three dropped on a multi-file zone yield three',
  filesToAdd(named(3), true).length,
  3,
);
check(
  'one file on a multi-file zone yields one',
  filesToAdd(named(1), true).length,
  1,
);

// An empty list is a drag that carried no files - a URL, a selection, a folder on some platforms.
check('an empty drop adds nothing', filesToAdd([], false).length, 0);
check(
  'an empty drop adds nothing when multiple',
  filesToAdd([], true).length,
  0,
);

const source = named(2);
check(
  'the result is a copy, not the input',
  filesToAdd(source, true) === source,
  false,
);

finish('dropzone-files');
