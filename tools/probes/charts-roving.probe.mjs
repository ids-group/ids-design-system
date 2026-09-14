import { nextRovingIndex } from '../../src/lib/components/charts-roving.ts';
import { check, finish } from './probe-check.mjs';

check('right moves on', nextRovingIndex('ArrowRight', 0, 5), 1);
check('down moves on', nextRovingIndex('ArrowDown', 0, 5), 1);
check('right wraps at the end', nextRovingIndex('ArrowRight', 4, 5), 0);
check('left moves back', nextRovingIndex('ArrowLeft', 3, 5), 2);
check('left wraps at the start', nextRovingIndex('ArrowLeft', 0, 5), 4);
check('Home reaches the first', nextRovingIndex('Home', 3, 5), 0);
check('End reaches the last', nextRovingIndex('End', 1, 5), 4);
check('a non-traversal key is left alone', nextRovingIndex('Enter', 1, 5), null);
check('an empty chart has nowhere to go', nextRovingIndex('End', 0, 0), null);
check('a single mark stays put', nextRovingIndex('ArrowRight', 0, 1), 0);

finish('charts-roving');
