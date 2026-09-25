import { staggerDelay } from '../../src/lib/components/charts-motion.ts';
import { check, finish } from './probe-check.mjs';

check('the first mark never waits', staggerDelay(0, 5, 30), 0);
check('stagger scales with the index', staggerDelay(3, 5, 30), 90);
check('a zero step means no stagger', staggerDelay(3, 5, 0), 0);
check(
  'a long series narrows its step to land the last mark within the budget',
  staggerDelay(99, 100, 30),
  260,
);
check(
  'a long series still arrives in order rather than landing at once',
  staggerDelay(50, 100, 30) < staggerDelay(51, 100, 30),
  true,
);
check('a lone mark never waits', staggerDelay(1, 1, 30), 0);
check('a negative step is no stagger', staggerDelay(3, 5, -30), 0);
check('a non-finite index is no stagger', staggerDelay(Number.NaN, 5, 30), 0);

finish('charts-motion');
