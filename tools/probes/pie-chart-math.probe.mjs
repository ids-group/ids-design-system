import {
  arcPath,
  groupSmallest,
  holeFraction,
  paletteIndex,
  positiveValues,
  resolveInnerRadius,
  resolveTotal,
  ringPoint,
  sliceArcs,
} from '../../src/lib/components/pie-chart/pie-chart.math.ts';
import { largestRemainder } from '../../src/lib/components/charts-format.ts';
import { check, finish } from './probe-check.mjs';

const QUARTER_TURN = Math.PI / 2;
const HALF_TURN = Math.PI;
const THREE_QUARTER_TURN = (3 * Math.PI) / 2;
const FULL_TURN = Math.PI * 2;

const CENTER = 50;
const OUTER_RADIUS = 50;
const INNER_RADIUS = 34;

const pathsFor = (values, innerRadius = INNER_RADIUS) =>
  sliceArcs(values).map((arc) =>
    arcPath(
      CENTER,
      CENTER,
      OUTER_RADIUS,
      innerRadius,
      arc.startAngle,
      arc.endAngle,
    ),
  );

// The angle convention the whole file rests on: 12 o'clock, running clockwise.
// SVG's y axis points down, so a chart written with the maths convention starts
// at 3 o'clock and turns the wrong way — and every arc still looks plausible.
check('the ring starts at 12 o clock', ringPoint(50, 50, 50, 0), '50 0');
check(
  'a quarter turn lands at 3 o clock, not 9',
  ringPoint(50, 50, 50, QUARTER_TURN),
  '100 50',
);

// A normal series: the shares are proportional and the last arc closes the ring.
check(
  'positiveValues passes a normal series through',
  positiveValues([40, 35, 25]),
  [40, 35, 25],
);
check('resolveTotal sums a normal series', resolveTotal([40, 35, 25]), 100);
check(
  'four equal slices take a quarter turn each',
  sliceArcs([25, 25, 25, 25]),
  [
    { startAngle: 0, endAngle: QUARTER_TURN },
    { startAngle: QUARTER_TURN, endAngle: HALF_TURN },
    { startAngle: HALF_TURN, endAngle: THREE_QUARTER_TURN },
    { startAngle: THREE_QUARTER_TURN, endAngle: FULL_TURN },
  ],
);
check(
  'a quarter segment is drawn with the short arc',
  arcPath(CENTER, CENTER, OUTER_RADIUS, INNER_RADIUS, 0, QUARTER_TURN),
  'M 50 0 A 50 50 0 0 1 100 50 L 84 50 A 34 34 0 0 0 50 16 Z',
);
// Past a half turn the large-arc flag has to flip, or the segment is drawn as its
// own complement — a three-quarter slice rendering as a quarter.
check(
  'a segment past a half turn sets the large-arc flag',
  arcPath(CENTER, CENTER, OUTER_RADIUS, INNER_RADIUS, 0, THREE_QUARTER_TURN),
  'M 50 0 A 50 50 0 1 1 0 50 L 16 50 A 34 34 0 1 0 50 16 Z',
);

// One slice: an arc of a full turn ends where it starts, and SVG draws NOTHING
// for it — the single-slice pie is the case that renders blank.
check('a single slice takes the whole ring', sliceArcs([5]), [
  { startAngle: 0, endAngle: FULL_TURN },
]);
check(
  'a full turn is drawn as a closed ring, not a zero-length arc',
  arcPath(CENTER, CENTER, OUTER_RADIUS, INNER_RADIUS, 0, FULL_TURN),
  'M 50 0 A 50 50 0 1 1 50 100 A 50 50 0 1 1 50 0 Z ' +
    'M 50 16 A 34 34 0 1 0 50 84 A 34 34 0 1 0 50 16 Z',
);
check(
  'the ring is two subpaths so the hole can be cut',
  arcPath(CENTER, CENTER, OUTER_RADIUS, INNER_RADIUS, 0, FULL_TURN).split('M')
    .length - 1,
  2,
);
check(
  'a full turn with no hole is a single closed disc',
  arcPath(CENTER, CENTER, OUTER_RADIUS, 0, 0, FULL_TURN),
  'M 50 0 A 50 50 0 1 1 50 100 A 50 50 0 1 1 50 0 Z',
);

// All zeros: the whole series is degenerate, and value / 0 is NaN in every arc.
check('an all-zero series has no total', resolveTotal([0, 0, 0]), 0);
check('an all-zero series keeps one arc per slice', sliceArcs([0, 0, 0]), [
  { startAngle: 0, endAngle: 0 },
  { startAngle: 0, endAngle: 0 },
  { startAngle: 0, endAngle: 0 },
]);
check('an all-zero series draws no path', pathsFor([0, 0, 0]), ['', '', '']);
check(
  'an all-zero series has no percentages to hand out',
  largestRemainder(positiveValues([0, 0, 0])),
  [0, 0, 0],
);

// A negative datum would sweep backwards, which draws the slice over its neighbour.
check(
  'a negative slice is worth nothing',
  positiveValues([10, -5, 10]),
  [10, 0, 10],
);
check(
  'a negative slice is left out of the total',
  resolveTotal([10, -5, 10]),
  20,
);
check('a negative slice takes no arc', sliceArcs([10, -5, 10]), [
  { startAngle: 0, endAngle: HALF_TURN },
  { startAngle: HALF_TURN, endAngle: HALF_TURN },
  { startAngle: HALF_TURN, endAngle: FULL_TURN },
]);

// NaN: one bad datum reaches every OTHER slice through the total, and `d="…NaN…"`
// is dropped silently — the chart renders blank with no error anywhere.
check(
  'a NaN slice is worth nothing',
  positiveValues([10, NaN, 10]),
  [10, 0, 10],
);
check('the slices beside a NaN keep their halves', sliceArcs([10, NaN, 10]), [
  { startAngle: 0, endAngle: HALF_TURN },
  { startAngle: HALF_TURN, endAngle: HALF_TURN },
  { startAngle: HALF_TURN, endAngle: FULL_TURN },
]);
check(
  'a NaN angle draws nothing rather than a NaN path',
  arcPath(CENTER, CENTER, OUTER_RADIUS, INNER_RADIUS, 0, NaN),
  '',
);

// Infinity is the datum that made the bar chart LIE: it became the scale, so its
// own geometry came out NaN while every honest slice beside it collapsed to zero.
check(
  'an Infinity slice is worth nothing',
  positiveValues([10, Infinity]),
  [10, 0],
);
check(
  'an Infinity slice is left out of the total',
  resolveTotal([10, Infinity]),
  10,
);
check(
  'the slice beside an Infinity keeps the whole ring',
  sliceArcs([10, Infinity]),
  [
    { startAngle: 0, endAngle: FULL_TURN },
    { startAngle: FULL_TURN, endAngle: FULL_TURN },
  ],
);
check(
  'an Infinity radius draws nothing rather than a NaN path',
  arcPath(CENTER, CENTER, Infinity, INNER_RADIUS, 0, QUARTER_TURN),
  '',
);

// The guard that matters most, stated once over everything hostile at once.
check(
  'no path from a hostile series contains NaN',
  pathsFor([40, NaN, -5, Infinity, 10]).join(' ').includes('NaN'),
  false,
);

// An empty series has no slices to divide the ring between.
check('an empty series has no total', resolveTotal([]), 0);
check('an empty series has no arcs', sliceArcs([]), []);

// Legend percentages. Rounding each share on its own loses a point on three equal
// slices, and a legend that reads 33/33/33 beside a full ring is visibly wrong.
const equalPercents = largestRemainder(positiveValues([5, 5, 5]));
check('three equal slices round to 34/33/33', equalPercents, [34, 33, 33]);
check(
  'legend percentages sum to exactly 100',
  equalPercents.reduce((sum, percent) => sum + percent, 0),
  100,
);
check(
  'the control: rounding each share on its own does not reach 100',
  [5, 5, 5]
    .map((value) => Math.round((value / 15) * 100))
    .reduce((sum, percent) => sum + percent, 0),
  99,
);
check(
  'a NaN slice takes no share of the legend',
  largestRemainder(positiveValues([10, NaN, 10])),
  [50, 0, 50],
);

// Zero must be honoured rather than read as unset, or `innerRadius="0"` silently draws a ring.
// At 1 and above there is no ring left, and a chart that silently renders nothing is the failure
// this file exists to prevent.
check(
  'the default innerRadius leaves a 34 unit hole',
  resolveInnerRadius(50, 0.68),
  34,
);
check('a zero innerRadius draws a solid pie', resolveInnerRadius(50, 0), 0);
check(
  'a NaN innerRadius falls back to the default',
  resolveInnerRadius(50, NaN),
  34,
);
check(
  'a negative innerRadius falls back to the default',
  resolveInnerRadius(50, -1),
  34,
);
check(
  'an innerRadius of 1 leaves no ring, so it falls back',
  resolveInnerRadius(50, 1),
  34,
);
check(
  'an innerRadius above 1 falls back to the default',
  resolveInnerRadius(50, 2),
  34,
);

// The hole fraction drives how wide the centre content may be, so a wrong one either overlaps the
// slices or wraps text that had room. At zero the component renders no centre content at all.
check(
  'the default innerRadius leaves 68% of the diameter',
  holeFraction(0.68),
  0.68,
);
check('a pie leaves no hole to hold the centre text', holeFraction(0), 0);
check(
  'an out-of-range innerRadius falls back with the radius',
  holeFraction(2),
  0.68,
);
check('a NaN innerRadius falls back with the radius', holeFraction(NaN), 0.68);
check(
  'a non-positive outer radius has no hole',
  resolveInnerRadius(-10, 0.68),
  0,
);
check(
  'an Infinity outer radius has no hole',
  resolveInnerRadius(Infinity, 0.68),
  0,
);

// Slots pin a slice to a palette colour, so filtering one out does not repaint
// the rest. They are 1-based; the index fallback is 0-based.
check('an explicit slot is 1-based', paletteIndex(3, 0, 8), 2);
check('no slot falls back to the index', paletteIndex(undefined, 5, 8), 5);
check('a slot past the palette wraps', paletteIndex(9, 0, 8), 0);
check('an index past the palette wraps', paletteIndex(undefined, 9, 8), 1);
check('slot 0 is not a slot', paletteIndex(0, 4, 8), 4);
check('a NaN slot is not a slot', paletteIndex(NaN, 4, 8), 4);

// Degenerate geometry: neither may reach the `d` attribute as a zero-size shape.
check(
  'a segment with no sweep draws nothing',
  arcPath(CENTER, CENTER, OUTER_RADIUS, INNER_RADIUS, 1, 1),
  '',
);
check(
  'a zero outer radius draws nothing',
  arcPath(CENTER, CENTER, 0, 0, 0, QUARTER_TURN),
  '',
);
check(
  'a segment with no hole closes through the centre',
  arcPath(CENTER, CENTER, OUTER_RADIUS, 0, 0, QUARTER_TURN),
  'M 50 0 A 50 50 0 0 1 100 50 L 50 50 Z',
);

// Legend grouping. The tail is summed, never dropped: a pie that quietly loses slices is a chart
// that lies about its own total.
const TAIL = [
  { id: 'a', label: 'A', value: 50 },
  { id: 'b', label: 'B', value: 30 },
  { id: 'c', label: 'C', value: 8 },
  { id: 'd', label: 'D', value: 7 },
  { id: 'e', label: 'E', value: 5 },
];
const grouped = groupSmallest(TAIL, 3, 'Other');
check('grouping keeps the limit as the slice count', grouped.length, 3);
check(
  'the largest slices survive, in the order they were given',
  grouped.slice(0, 2).map((slice) => slice.id),
  ['a', 'b'],
);
check('the tail is summed, not dropped', grouped[2].value, 20);
check('the total is unchanged by grouping', resolveTotal(grouped.map((s) => s.value)), resolveTotal(TAIL.map((s) => s.value)));
check('the grouped slice takes the neutral slot', grouped[2].slot, 8);
check('the grouped slice is named by the caller', groupSmallest(TAIL, 3, 'Прочее')[2].label, 'Прочее');
// The negative arms: off by default, and never firing when there is nothing to group.
check('no limit leaves the data alone', groupSmallest(TAIL, null, 'Other').length, 5);
check('a limit at or above the count leaves the data alone', groupSmallest(TAIL, 5, 'Other').length, 5);
check('a limit below two is ignored', groupSmallest(TAIL, 1, 'Other').length, 5);
check(
  'a negative slice contributes nothing to the tail rather than shrinking it',
  groupSmallest([...TAIL.slice(0, 4), { id: 'f', label: 'F', value: -100 }], 3, 'Other')[2].value,
  15,
);

finish('pie-chart-math');
