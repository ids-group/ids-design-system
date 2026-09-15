import {
  resolveMax,
  segmentWidths,
  widthPercent,
} from '../../src/lib/components/bar-chart/bar-chart.math.ts';
import { check, finish } from './probe-check.mjs';

// A normal dataset: the largest row fills the track, the rest take their share.
check('resolveMax takes the largest value', resolveMax(null, [40, 45, 50]), 50);
check('widthPercent fills the largest row', widthPercent(50, 50), 100);
check('widthPercent is proportional', widthPercent(40, 50), 80);

// All zeros: the whole series is degenerate, and 0 / 0 is NaN.
check(
  'an all-zero series draws no bar',
  widthPercent(0, resolveMax(null, [0, 0, 0])),
  0,
);

// An empty series has no largest value to pick, and Math.max() of nothing is -Infinity.
check('resolveMax of an empty series is zero', resolveMax(null, []), 0);

// A negative datum would draw a bar growing leftwards out of its track.
check(
  'resolveMax ignores a negative beside a positive',
  resolveMax(null, [40, -10, 100]),
  100,
);
check(
  'widthPercent clamps a negative value to zero',
  widthPercent(-10, 100),
  0,
);

// NaN: Math.max(NaN, 0) is NaN, so the lower clamp alone lets `width: NaN%` through.
check('resolveMax skips a NaN row', resolveMax(null, [10, NaN, 20]), 20);
check('widthPercent on a NaN value is zero', widthPercent(NaN, 200), 0);
check('widthPercent on a NaN max is zero', widthPercent(50, NaN), 0);

// Infinity is the row that made the chart LIE: it became the track length, so its
// own width came out NaN while every honest row beside it collapsed to 0% and went
// on printing its correct number.
check('resolveMax skips an Infinity row', resolveMax(null, [10, Infinity]), 10);
check(
  'widthPercent on an Infinity value is zero',
  widthPercent(Infinity, 10),
  0,
);
check(
  'a row beside an Infinity row keeps its own width',
  widthPercent(10, resolveMax(null, [10, Infinity])),
  100,
);
check(
  'resolveMax falls back to the data when the explicit max is Infinity',
  resolveMax(Infinity, [10, 20]),
  20,
);
check(
  'resolveMax falls back to the data when the explicit max is NaN',
  resolveMax(NaN, [10, 20]),
  20,
);

// An explicit max below the data overflows on purpose — the caller said so, and
// `.track` clips it. Asserted so that adding an upper clamp is a deliberate change.
check('an explicit max wins over the data', resolveMax(200, [40, 50]), 200);
check('an explicit max below the data is kept', resolveMax(50, [100]), 50);
check('widthPercent overflows an explicit max', widthPercent(100, 50), 200);
check(
  'a non-positive explicit max falls back to the data',
  resolveMax(0, [10, 20]),
  20,
);

finish('bar-chart-math');

// Segments size against their own sum, so a set that does not add up to the row's value still
// fills the track — the alternative draws the shortfall as an unlabelled category.
check(
  'segments fill the track',
  segmentWidths([291000, 74000, 47000]).reduce((sum, part) => sum + part, 0),
  100,
);
check('a two-part split is proportional', segmentWidths([3, 1]), [75, 25]);

// No positive total: nothing to divide, and 0 / 0 would write `width: NaN%`.
check('an all-zero set has no widths', segmentWidths([0, 0]), []);
check('an empty set has no widths', segmentWidths([]), []);

// A negative or non-finite part must not consume track or become one.
check('a negative part takes no width', segmentWidths([-10, 10]), [0, 100]);
check('a NaN part takes no width', segmentWidths([NaN, 10]), [0, 100]);
check(
  'an Infinity part takes no width',
  segmentWidths([Infinity, 10]),
  [0, 100],
);
