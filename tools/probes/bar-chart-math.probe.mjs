import {
  barExtent,
  isMissing,
  partSpans,
  placeRows,
  plainValue,
  resolveMax,
  segmentWidths,
  shownRows,
  widthPercent,
} from '../../src/lib/components/bar-chart/bar-chart.math.ts';
import { check, finish } from './probe-check.mjs';

// ------------------------------------------------------------------ extents
check('a number spans from zero', barExtent(40), { low: 0, high: 40 });
check('a pair spans between its ends', barExtent([10, 40]), {
  low: 10,
  high: 40,
});
// A reader who writes the ends the other way round means the same band, and a bar of negative
// width draws nothing at all - so the pair is normalised rather than refused.
check('a reversed pair is normalised', barExtent([40, 10]), {
  low: 10,
  high: 40,
});
check('a negative number draws an empty track', barExtent(-25), {
  low: 0,
  high: 0,
});
check('a negative number is still reported', plainValue(-25), -25);
check('a pair has no plain value', plainValue([10, 40]), null);
check('a non-finite number has no plain value', plainValue(Number.NaN), null);
check('a pair of one reading is a zero-width band', barExtent([12, 12]), {
  low: 12,
  high: 12,
});
check('a non-finite number is nothing', barExtent(Number.NaN), {
  low: 0,
  high: 0,
});
check('a pair with a non-finite end is nothing', barExtent([5, Number.NaN]), {
  low: 0,
  high: 0,
});
check('a NaN number is missing', isMissing(Number.NaN), true);
check(
  'an Infinity number is missing',
  isMissing(Number.POSITIVE_INFINITY),
  true,
);
check(
  'a pair with a non-finite end is missing',
  isMissing([5, Number.NaN]),
  true,
);
check('a zero is a reading, not missing', isMissing(0), false);
check('a finite pair is not missing', isMissing([10, 40]), false);

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

// ------------------------------------------------------------------ groups, detached rows
const funnel = [
  { label: 'Opened', value: 18730 },
  {
    id: 'site',
    label: 'Microsite accessed',
    value: 6420,
    children: [
      { label: 'How conversions work', value: 2210 },
      { id: 'compare', label: 'Compare plans', value: 1630 },
    ],
  },
  { label: 'Form submitted', value: 640 },
  { label: 'Completed or exited', value: 9870, detached: true },
];
const placed = placeRows(funnel);

check(
  'children are placed right after their parent',
  placed.map((entry) => entry.key),
  ['0', 'site', 'site/0', 'site/compare', '2', '3'],
);
check(
  'a child names its parent; a top-level row has none',
  placed.map((entry) => entry.parentKey),
  [null, null, 'site', 'site', null, null],
);
// A child is a share of its parent ("each counted from these 100%"), not of the chart's max.
check('a child is measured against its parent span', placed[2].scale, 6420);
check('a top-level row is measured against max', placed[1].scale, null);
check(
  'a child of a 6,420 parent at 2,210 is 34.4% of the track',
  Math.round(widthPercent(2210, placed[2].scale) * 10) / 10,
  34.4,
);
check(
  'a child of a missing parent draws no bar',
  widthPercent(
    5,
    placeRows([
      { label: 'x', value: Number.NaN, children: [{ label: 'y', value: 5 }] },
    ])[1].scale,
  ),
  0,
);
check(
  'only the first detached row of a run gets the divider',
  placeRows([
    { label: 'a', value: 1 },
    { label: 'b', value: 1, detached: true },
    { label: 'c', value: 1, detached: true },
  ]).map((entry) => entry.startsDetached),
  [false, true, false],
);
check(
  'a detached first row has nothing to divide from',
  placeRows([{ label: 'a', value: 1, detached: true }])[0].startsDetached,
  false,
);
check(
  'a grandchild is ignored: one level only',
  placeRows([
    {
      label: 'a',
      value: 4,
      children: [
        { label: 'b', value: 2, children: [{ label: 'c', value: 1 }] },
      ],
    },
  ]).length,
  2,
);

check(
  'a closed group shows its parent only',
  shownRows(placed, new Set()).map((entry) => entry.key),
  ['0', 'site', '2', '3'],
);
check(
  'an open group shows its children',
  shownRows(placed, new Set(['site'])).map((entry) => entry.key),
  ['0', 'site', 'site/0', 'site/compare', '2', '3'],
);
check(
  'rows without children place exactly as given',
  placeRows([
    { label: 'a', value: 1 },
    { label: 'b', value: 2 },
  ]).map((entry) => entry.key),
  ['0', '1'],
);

// A detached row is not a part of the whole: it takes no share and adds nothing to the total.
check('a detached row is left out of the parts', partSpans(funnel), [
  18730,
  6420,
  640,
  Number.NaN,
]);
check(
  'without detached rows the parts are the spans',
  partSpans([
    { label: 'a', value: [2, 5] },
    { label: 'b', value: 4 },
  ]),
  [3, 4],
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
