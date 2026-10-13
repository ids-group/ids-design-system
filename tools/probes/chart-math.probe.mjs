import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { registerComponentsFacade } from './register-components-facade.mjs';
import { check, finish } from './probe-check.mjs';

const components = registerComponentsFacade(import.meta.url, [
  'charts-scale.ts',
  'charts-format.ts',
]);

const {
  axisDomain,
  chartPlot,
  chartViewHeight,
  secondaryAxis,
  annotationMarks,
  categoryAt,
  changeBetween,
  stackOffsets,
  thresholdMarks,
  valueScale,
} = await import(
  pathToFileURL(join(components, 'chart', 'chart.math.ts')).href
);

check('the plot leaves a gutter for each axis', chartPlot(640, 240, 46, 20), {
  left: 46,
  top: 20,
  width: 582,
  height: 240,
});
check(
  'the plot width follows the measured width',
  chartPlot(320, 240, 46, 20),
  {
    left: 46,
    top: 20,
    width: 262,
    height: 240,
  },
);
check(
  'the plot height does NOT follow the measured width',
  chartPlot(320, 240, 46, 20).height,
  240,
);
check(
  'a width narrower than its gutters leaves no plot',
  chartPlot(40, 240, 46, 20).width,
  0,
);
check('an unmeasured width leaves no plot', chartPlot(0, 240, 46, 20).width, 0);
check(
  'a negative plot height is floored at zero',
  chartPlot(640, -50, 46, 20).height,
  0,
);
check(
  'a wider axis gutter takes it out of the plot',
  chartPlot(640, 240, 80, 20),
  {
    left: 80,
    top: 20,
    width: 548,
    height: 240,
  },
);

check(
  'an all-positive view budgets value space above only',
  chartViewHeight(240, 20),
  290,
);
check(
  'a domain reaching below zero budgets it at both ends',
  chartViewHeight(240, 20, true),
  310,
);
check(
  'the reservation is exactly one value space',
  chartViewHeight(240, 20, true) - chartViewHeight(240, 20, false),
  20,
);
check(
  'no value space leaves the category row alone',
  chartViewHeight(240, 0, true),
  270,
);
check(
  'the view height grows with the plot one for one',
  chartViewHeight(340, 20) - chartViewHeight(240, 20),
  100,
);
check(
  'the view height grows with value space one for one while positive',
  chartViewHeight(240, 30) - chartViewHeight(240, 20),
  10,
);
check(
  'the view height grows with value space two for one below zero',
  chartViewHeight(240, 30, true) - chartViewHeight(240, 20, true),
  20,
);

check('one reported set rounds up to a tick', axisDomain([[10, 20, 30]], 5), {
  min: 0,
  max: 30,
});
check('two reported sets take the union', axisDomain([[10], [45]], 5), {
  min: 0,
  max: 50,
});
check(
  'a reported negative opens the domain below zero',
  axisDomain([[-20, 40]], 5),
  {
    min: -20,
    max: 40,
  },
);
check('zero is always in the domain', axisDomain([[8, 12]], 5), {
  min: 0,
  max: 12,
});
check(
  'a non-finite reading is not a bound',
  axisDomain([[NaN, Infinity, 5]], 5),
  {
    min: 0,
    max: 5,
  },
);
check('nothing reported is a degenerate domain', axisDomain([], 5), {
  min: 0,
  max: 0,
});
check('a pin widens the domain', axisDomain([[10]], 5, null, 100), {
  min: 0,
  max: 100,
});
check(
  'a pin under the data does not clip it',
  axisDomain([[80]], 5, null, 10),
  {
    min: 0,
    max: 80,
  },
);
check(
  'a minimum pin opens the domain below zero',
  axisDomain([[10]], 5, -50, null),
  {
    min: -50,
    max: 10,
  },
);
check(
  'a minimum pin above zero does not raise the floor',
  axisDomain([[10]], 5, 5, null),
  {
    min: 0,
    max: 10,
  },
);
check('a non-finite pin is ignored', axisDomain([[10]], 5, NaN, Infinity), {
  min: 0,
  max: 10,
});

const positive = valueScale({ min: 0, max: 100 }, 10, 200);
check('the domain floor sits on the baseline', positive(0), 210);
check('the domain ceiling sits at the plot top', positive(100), 10);
check('a mid value interpolates', positive(50), 110);
check('a value above the domain clamps to the top', positive(150), 10);
check('a value below the domain clamps to the baseline', positive(-10), 210);
check('an unplottable value falls to the baseline', positive(NaN), 210);

const signed = valueScale({ min: -50, max: 50 }, 0, 100);
check('zero sits mid-plot on a signed domain', signed(0), 50);
check('the signed ceiling sits at the plot top', signed(50), 0);
check('the signed floor sits on the baseline', signed(-50), 100);

const degenerate = valueScale({ min: 0, max: 0 }, 10, 200);
check(
  'a degenerate domain puts everything on the baseline',
  degenerate(7),
  210,
);

// --- Reference lines and bands ----------------------------------------------
// One plot, one scale: 0-100 over 200px from y=20, so a value's y is 220 - 2v and every number
// below is hand-computed from that rather than read back off the function.
const thresholdPlot = { left: 40, top: 20, width: 500, height: 200 };
const thresholdScale = valueScale({ min: 0, max: 100 }, 20, 200);
const marksOf = (thresholds) =>
  thresholdMarks(thresholds, thresholdPlot, thresholdScale);

const targetLine = marksOf([{ value: 85, label: 'Target' }])[0];
check('a reference line starts at the plot edge', targetLine.left, 40);
check('a reference line ends at the far plot edge', targetLine.right, 540);
check('a reference line sits at its own value', targetLine.y, 50);
check('a line is not a band', targetLine.band, false);
check('a line has no height to fill', targetLine.height, 0);
check('an unset dash reads as dashed', targetLine.dash, 'dashed');
check('an unset colour leaves the token in charge', targetLine.color, null);
check("the label anchors inside the plot's left edge", targetLine.labelX, 44);
check('the label clears the line it names', targetLine.labelY, 45);

check(
  'a dotted line keeps its own dash',
  marksOf([{ value: 85, dash: 'dotted' }])[0].dash,
  'dotted',
);
check(
  'an unlabelled threshold carries no label',
  marksOf([{ value: 85 }])[0].label,
  '',
);

const band = marksOf([{ value: 78, to: 88, label: 'Agreed range' }])[0];
check('a band is a band', band.band, true);
check('a band starts at its upper reading', band.top, 44);
check('a band spans both readings', band.height, 20);
check('a band fills the plot width', band.width, 500);
check('a band label clears its upper edge', band.labelY, 39);

// A ceiling-and-floor pair is naturally written high end first, and must read the same.
const reversed = marksOf([{ value: 88, to: 78, label: 'Agreed range' }])[0];
check(
  'a band written high-end first starts at the same edge',
  reversed.top,
  44,
);
check(
  'a band written high-end first spans the same height',
  reversed.height,
  20,
);

check('no thresholds draw nothing', marksOf([]).length, 0);
check(
  'every threshold is laid out, in the order given',
  marksOf([{ value: 85 }, { value: 73 }]).map((mark) => mark.y),
  [50, 74],
);

// THE SECOND VALUE AXIS.
//
// Misha's combo: nine months on a 0-40K primary (5 rows, 4 intervals) against a running total
// reaching 189900. 189900 / 4 = 47475 a row, which rounds up to the 50000 step that puts the last
// label on 200K.
const PRIMARY_TICKS = [0, 10000, 20000, 30000, 40000];

const aligned = secondaryAxis(PRIMARY_TICKS, [[189900]], 5, 'aligned');
check(
  'an aligned second axis hangs on the first axis rows',
  aligned.aligned,
  true,
);
check(
  'an aligned second axis snaps its step up',
  aligned.ticks,
  [0, 50000, 100000, 150000, 200000],
);
check('an aligned second axis ends on its own last row', aligned.domain, {
  min: 0,
  max: 200000,
});

const exact = secondaryAxis(PRIMARY_TICKS, [[189900]], 5, 'exact');
check('an exact second axis ends on the data', exact.domain, {
  min: 0,
  max: 189900,
});
check(
  'an exact second axis divides the same rows',
  exact.ticks,
  [0, 47475, 94950, 142425, 189900],
);

// A pinned ceiling replaces what the data reported, so two plots read against each other keep the
// same second axis when one of them loses its tallest reading.
const pinned = secondaryAxis(PRIMARY_TICKS, [[189900]], 5, 'dual-grid', 250000);
check('a pinned second ceiling wins over the data', pinned.domain.max, 250000);
const pinnedBelow = secondaryAxis(
  PRIMARY_TICKS,
  [[189900]],
  5,
  'dual-grid',
  100000,
);
check(
  'a pinned ceiling under the data still wins',
  pinnedBelow.domain.max,
  100000,
);
const unpinned = secondaryAxis(PRIMARY_TICKS, [[189900]], 5, 'dual-grid', null);
check(
  'no pin leaves the domain where the data put it',
  unpinned.domain.max,
  secondaryAxis(PRIMARY_TICKS, [[189900]], 5, 'dual-grid').domain.max,
);

const dualGrid = secondaryAxis(PRIMARY_TICKS, [[189900]], 5, 'dual-grid');
check('a dual-grid second axis shares no rows', dualGrid.aligned, false);
check('a dual-grid second axis nices its own domain', dualGrid.domain, {
  min: 0,
  max: 200000,
});

check(
  'a stacked second axis is niced on its own too',
  secondaryAxis(PRIMARY_TICKS, [[189900]], 5, 'split').aligned,
  false,
);

// A step multiplied back out lands off by a bit, and an axis label reading
// 149.99999999999997 is the visible form of that.
check(
  'an aligned tick is rounded back to a printable number',
  secondaryAxis([0, 1, 2, 3], [[0.3]], 4, 'exact').ticks,
  [0, 0.1, 0.2, 0.3],
);

// Alignment needs a SHARED ZERO ROW: a second scale hung on rows whose zero sits elsewhere would
// put a reading above the line on one axis and below it on the other.
const signedRows = [-20, 0, 20, 40, 60];
const signedSecond = secondaryAxis(signedRows, [[-150, 450]], 5, 'exact');
check(
  'a signed primary puts the second axis zero on the same row',
  signedSecond.ticks,
  [-150, 0, 150, 300, 450],
);
check(
  'a signed second axis reaches both of its own ends',
  signedSecond.domain,
  {
    min: -150,
    max: 450,
  },
);

check(
  'rows with no zero of their own cannot be shared',
  secondaryAxis([10, 20, 30], [[500]], 3, 'aligned').aligned,
  false,
);
check(
  'a single row cannot be shared',
  secondaryAxis([0], [[500]], 3, 'aligned').aligned,
  false,
);
check(
  'a positive reading with no rows above zero falls back',
  secondaryAxis([-30, -20, -10, 0], [[500]], 4, 'aligned').aligned,
  false,
);
check(
  'nothing reported leaves a degenerate second axis',
  secondaryAxis(PRIMARY_TICKS, [], 5, 'aligned').domain,
  {
    min: 0,
    max: 0,
  },
);
check(
  'a non-finite reading never reaches the second axis domain',
  secondaryAxis(PRIMARY_TICKS, [[Number.NaN, 120]], 5, 'exact').domain.max,
  120,
);

// The plot's right gutter, which only a drawn-on-the-right second axis asks for.
check(
  'the plot gives the right-hand labels their own gutter',
  chartPlot(640, 240, 46, 20, 46).width,
  548,
);

// Stack offsets. Two series of two categories throughout: `[[10, 20], [30, 40]]` is series-major,
// so `[0][1]` is the first series' second category.
check(
  'grouped puts each series in its own slot',
  stackOffsets(
    [
      [10, 20],
      [30, 40],
    ],
    'grouped',
  ),
  [
    [
      { from: 0, to: 10 },
      { from: 0, to: 20 },
    ],
    [
      { from: 0, to: 30 },
      { from: 0, to: 40 },
    ],
  ],
);
check(
  'stacked accumulates',
  stackOffsets(
    [
      [10, 20],
      [30, 40],
    ],
    'stacked',
  ),
  [
    [
      { from: 0, to: 10 },
      { from: 0, to: 20 },
    ],
    [
      { from: 10, to: 40 },
      { from: 20, to: 60 },
    ],
  ],
);
check(
  'normalized fills the axis',
  stackOffsets(
    [
      [10, 20],
      [30, 40],
    ],
    'normalized',
  ),
  [
    [
      { from: 0, to: 0.25 },
      { from: 0, to: 1 / 3 },
    ],
    [
      { from: 0.25, to: 1 },
      { from: 1 / 3, to: 1 },
    ],
  ],
);
check('none is grouped with one slot', stackOffsets([[10, 20]], 'none'), [
  [
    { from: 0, to: 10 },
    { from: 0, to: 20 },
  ],
]);
check('nothing to stack stacks to nothing', stackOffsets([], 'stacked'), []);
check(
  'a non-finite reading contributes nothing and shifts nothing',
  stackOffsets([[Number.NaN], [30]], 'stacked'),
  [[{ from: 0, to: 0 }], [{ from: 0, to: 30 }]],
);
check(
  'a category with no readings at all normalizes to zero rather than NaN',
  stackOffsets([[0], [0]], 'normalized'),
  [[{ from: 0, to: 0 }], [{ from: 0, to: 0 }]],
);
// Signed stacking runs two piles, so a negative segment hangs below the baseline instead of
// eating the positive pile it would otherwise be subtracted from.
check(
  'a negative segment stacks downward on its own pile',
  stackOffsets([[10], [-30], [20]], 'stacked'),
  [[{ from: 0, to: 10 }], [{ from: 0, to: -30 }], [{ from: 10, to: 30 }]],
);
check(
  'normalized shares are taken against the magnitudes, so the axis still ends at one',
  stackOffsets([[10], [-30]], 'normalized'),
  [[{ from: 0, to: 0.25 }], [{ from: 0, to: -0.75 }]],
);
// A short series leaves the categories past its end untouched rather than shortening the stack.
check(
  'a ragged series stacks only the categories it reaches',
  stackOffsets([[10, 20], [30]], 'stacked'),
  [
    [
      { from: 0, to: 10 },
      { from: 0, to: 20 },
    ],
    [{ from: 10, to: 40 }],
  ],
);

// An annotation sits above its reading, and below it only where there is no room: a peak lands at
// the top of the plot, which is exactly where a label clamped upward covers its own marker.
const high = annotationMarks([{ key: 'a', label: 'Peak', x: 320, y: 4 }], 640);
check('a label with no room above drops below the reading', high[0].y, 16);
const room = annotationMarks(
  [{ key: 'b', label: 'Launch', x: 320, y: 200 }],
  640,
);
check('a label with room sits above the reading', room[0].y, 188);

// A centred label at the first or last category hangs half outside the viewBox and is clipped.
const left = annotationMarks(
  [{ key: 'c', label: 'First', x: 10, y: 100 }],
  640,
);
check(
  'a label near the left edge anchors to its start',
  left[0].anchor,
  'start',
);
const right = annotationMarks(
  [{ key: 'd', label: 'Last', x: 630, y: 100 }],
  640,
);
check('a label near the right edge anchors to its end', right[0].anchor, 'end');
const middle = annotationMarks(
  [{ key: 'e', label: 'Mid', x: 320, y: 100 }],
  640,
);
check('a label away from both edges centres', middle[0].anchor, 'middle');

// The half band at each end belongs to the first and last category: a reader aiming at the edge
// means the edge category, not nothing.
check(
  'a pointer at the left edge is the first category',
  categoryAt(40, 40, 600, 6),
  0,
);
check(
  'a pointer at the right edge is the last category',
  categoryAt(640, 40, 600, 6),
  5,
);
check(
  'a pointer mid-plot is the middle category',
  categoryAt(340, 40, 600, 6),
  3,
);
check('a pointer left of the plot is nowhere', categoryAt(10, 40, 600, 6), -1);
check(
  'a pointer right of the plot is nowhere',
  categoryAt(700, 40, 600, 6),
  -1,
);
check('no categories means nowhere', categoryAt(340, 40, 600, 0), -1);
check('a zero-width plot means nowhere', categoryAt(340, 40, 0, 6), -1);
check('a NaN pointer means nowhere', categoryAt(NaN, 40, 600, 6), -1);

// ------------------------------------------------------------ showChange
check('a rise reads its percentage', changeBetween(40, 50, 'en'), {
  rising: true,
  label: '+25.0%',
});
check('a fall reads its percentage', changeBetween(50, 40, 'en'), {
  rising: false,
  label: '-20.0%',
});
check(
  'a rise from zero is coloured and unlabelled',
  changeBetween(0, 40, 'en'),
  {
    rising: true,
    label: null,
  },
);
check(
  'a fall from zero is coloured and unlabelled',
  changeBetween(0, -40, 'en'),
  {
    rising: false,
    label: null,
  },
);

finish('chart-math');
