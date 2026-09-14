import { staggerDelay } from '../../src/lib/components/charts-motion.ts';
import { check, finish } from './probe-check.mjs';

check('the first mark never waits', staggerDelay(0, 30), 0);
check('stagger scales with the index', staggerDelay(3, 30), 90);
check('a zero step means no stagger', staggerDelay(3, 0), 0);
check(
  'the delay is capped so a long series does not crawl',
  staggerDelay(100, 30),
  300,
);
check('a negative step is no stagger', staggerDelay(3, -30), 0);
check('a non-finite index is no stagger', staggerDelay(Number.NaN, 30), 0);

finish('charts-motion');
