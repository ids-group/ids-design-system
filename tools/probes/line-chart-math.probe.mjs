import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { registerComponentsFacade } from './register-components-facade.mjs';
import { check, finish } from './probe-check.mjs';

const components = registerComponentsFacade(import.meta.url, [
  'charts-scale.ts',
  'charts-format.ts',
  'charts-path.ts',
]);

const {
  alignSeriesValues,
  areaPath,
  axisLayout,
  categoryCenters,
  categoryLabelStride,
  chartLayout,
  domainMaxOf,
  lineSegments,
  linePath,
  normalizeTickCount,
  paletteIndexFor,
  polylinePoints,
  roundStepAtLeast,
  seriesPoints,
  valueY,
} = await import(
  pathToFileURL(join(components, 'line-chart', 'line-chart.math.ts')).href
);

const plot = chartLayout('aligned', false).primaryPlot;
const stackedLayout = chartLayout('split', true);
const categories = ['Jan', 'Feb', 'Mar'];
const centers = categoryCenters(categories.length, plot);
const point = (x, y) => ({ categoryIndex: 0, x, y, value: 1 });
const noDigitsLost = (text) => !/NaN|Infinity|undefined/.test(text);

// ---------------------------------------------------------------- axis modes
// The primary peaks at 2410 and the secondary at 75 in every mode below, so the
// four axis modes are compared on one dataset and differ only where they should.
const PRIMARY_PEAK = 2410;
const SECONDARY_PEAK = 75;
const PRIMARY_TICKS = [0, 500, 1000, 1500, 2000, 2500];

const rounded = axisLayout(PRIMARY_PEAK, SECONDARY_PEAK, 'aligned', 5);
const exact = axisLayout(PRIMARY_PEAK, SECONDARY_PEAK, 'exact', 5);
const independent = axisLayout(PRIMARY_PEAK, SECONDARY_PEAK, 'dual-grid', 5);
const stacked = axisLayout(PRIMARY_PEAK, SECONDARY_PEAK, 'split', 5);

check(
  'the primary axis is niced the same way in every mode',
  [
    rounded.primary.ticks,
    exact.primary.ticks,
    independent.primary.ticks,
    stacked.primary.ticks,
  ],
  [PRIMARY_TICKS, PRIMARY_TICKS, PRIMARY_TICKS, PRIMARY_TICKS],
);
check('the primary max is the last primary tick', rounded.primary.max, 2500);

// 'aligned' — the spec's own worked numbers: a secondary peak of 75 labels
// 0 · 20 · 40 · 60 · 80 · 100, so the series stops short of the top.
check(
  'rounded labels the secondary axis in round steps',
  rounded.secondary.ticks,
  [0, 20, 40, 60, 80, 100],
);
check('rounded overshoots the secondary data', rounded.secondary.max, 100);
check(
  'rounded gives the secondary axis one tick per primary tick',
  rounded.secondary.ticks.length,
  rounded.primary.ticks.length,
);
check('rounded shares the primary gridlines', rounded.alignedTicks, true);

// 'exact' — the same peak, the same gridlines, and the labels land on the data:
// 0 · 15 · 30 · 45 · 60 · 75, so the series uses the full height.
check(
  'exact labels the secondary axis on the data',
  exact.secondary.ticks,
  [0, 15, 30, 45, 60, 75],
);
check('exact ends at the secondary data', exact.secondary.max, SECONDARY_PEAK);
check(
  'exact gives the secondary axis one tick per primary tick',
  exact.secondary.ticks.length,
  exact.primary.ticks.length,
);
check('exact shares the primary gridlines', exact.alignedTicks, true);

// 'dual-grid' — niced on its own, so its gridlines fall somewhere else entirely.
check(
  'independent nices the secondary axis on its own',
  independent.secondary.ticks,
  [0, 20, 40, 60, 80],
);
check('independent ends at its own nice max', independent.secondary.max, 80);
check(
  'independent does not share the primary gridlines',
  independent.alignedTicks,
  false,
);

// 'split' — two plots, so there is no alignment question to answer: the scales
// are the independent ones and the difference is the layout below.
check('stacked scales the secondary axis independently', stacked.secondary, {
  max: 80,
  ticks: [0, 20, 40, 60, 80],
});
check(
  'stacked does not share the primary gridlines',
  stacked.alignedTicks,
  false,
);
check(
  'stacked splits the plot in two',
  stackedLayout.primaryPlot.top < stackedLayout.secondaryPlot.top &&
    stackedLayout.primaryPlot.height === stackedLayout.secondaryPlot.height,
  true,
);
check(
  'stacked keeps both plots inside the canvas',
  stackedLayout.secondaryPlot.top + stackedLayout.secondaryPlot.height <=
    stackedLayout.categoryLabelY,
  true,
);
check(
  'an unstacked chart draws both axes against one plot',
  chartLayout('aligned', true).stacked,
  false,
);
check(
  'a right-hand axis gets a gutter for its labels',
  chartLayout('aligned', true).primaryPlot.width <
    chartLayout('aligned', false).primaryPlot.width,
  true,
);

// A domain whose own nice step would round DOWN: 650 / 5 is 130, and the d3 rule
// snaps that to 100 — five intervals of which reach 500, short of the data. The
// aligned axis must grow the step instead, not the interval count.
const short = axisLayout(PRIMARY_PEAK, 650, 'aligned', 5);
check(
  'rounded never stops below its own data',
  short.secondary.max >= 650,
  true,
);
check(
  'rounded still uses the primary intervals',
  short.secondary.ticks.length,
  6,
);

check('roundStepAtLeast snaps 15 up to 20', roundStepAtLeast(15), 20);
check('roundStepAtLeast leaves a round step alone', roundStepAtLeast(20), 20);
check('roundStepAtLeast works below one', roundStepAtLeast(0.15), 0.2);
check(
  'roundStepAtLeast on a non-positive step is zero',
  roundStepAtLeast(0),
  0,
);
check('roundStepAtLeast on a NaN step is zero', roundStepAtLeast(NaN), 0);

check(
  'no secondary series means no secondary axis',
  axisLayout(PRIMARY_PEAK, null, 'aligned', 5).secondary,
  null,
);

// ---------------------------------------------------------------------- gaps
const withHole = [10, null, 30];

check(
  'break keeps a missing reading missing',
  alignSeriesValues(withHole, 3, 'break'),
  [10, null, 30],
);
check(
  'zero draws a missing reading at zero',
  alignSeriesValues(withHole, 3, 'zero'),
  [10, 0, 30],
);
check(
  'break splits the line either side of the hole',
  lineSegments(
    seriesPoints(alignSeriesValues(withHole, 3, 'break'), 100, plot, centers),
  ).length,
  2,
);
check(
  'zero keeps the line in one piece',
  lineSegments(
    seriesPoints(alignSeriesValues(withHole, 3, 'zero'), 100, plot, centers),
  ).length,
  1,
);
check(
  'a hole is not drawn as a value',
  seriesPoints(alignSeriesValues(withHole, 3, 'break'), 100, plot, centers)[1],
  null,
);
check(
  'a reading with no category position is not drawn',
  seriesPoints([10, 20], 100, plot, categoryCenters(1, plot))[1],
  null,
);
check(
  'seriesPoints refuses a raw NaN reading',
  seriesPoints([NaN], 100, plot, centers)[0],
  null,
);

// --------------------------------------------------------- a length mismatch
// Neither shape throws: the chart draws what lines up and stops, which the reader
// can see, rather than taking the page down with it.
check(
  'a series longer than the categories loses its tail',
  alignSeriesValues([1, 2, 3, 4, 5], 3, 'break'),
  [1, 2, 3],
);
check(
  'a series shorter than the categories ends early',
  alignSeriesValues([1, 2], 3, 'break'),
  [1, 2, null],
);
check(
  'a short series still draws the part that lines up',
  lineSegments(
    seriesPoints(alignSeriesValues([1, 2], 3, 'break'), 100, plot, centers),
  ).length,
  1,
);
check(
  'a series against no categories draws nothing',
  alignSeriesValues([1, 2, 3], 0, 'break'),
  [],
);

// ------------------------------------------------------- an all-null series
const allNull = [null, null, null];

check(
  'an all-null series has no readings',
  alignSeriesValues(allNull, 3, 'break'),
  [null, null, null],
);
check(
  'an all-null series has no segments',
  lineSegments(
    seriesPoints(alignSeriesValues(allNull, 3, 'break'), 100, plot, centers),
  ),
  [],
);
check('an all-null series has no domain', domainMaxOf([allNull]), 0);
check(
  'an all-null series emits no path',
  areaPath(
    lineSegments(
      seriesPoints(alignSeriesValues(allNull, 3, 'break'), 100, plot, centers),
    )[0] ?? [],
    plot.top + plot.height,
  ),
  '',
);
check(
  'an all-null series at gaps=zero draws a flat line',
  seriesPoints(alignSeriesValues(allNull, 3, 'zero'), 100, plot, centers).map(
    (entry) => entry.y,
  ),
  [plot.top + plot.height, plot.top + plot.height, plot.top + plot.height],
);

// ----------------------------------------------------------- NaN and Infinity
// A NaN inside a `points` list or a path `d` voids the whole attribute: the line
// disappears and nothing is logged. This repo shipped that once.
check(
  'a NaN reading is a hole, not a coordinate',
  alignSeriesValues([10, NaN, 30], 3, 'break'),
  [10, null, 30],
);
check(
  'an Infinity reading is a hole, not a coordinate',
  alignSeriesValues([10, Infinity, 30], 3, 'break'),
  [10, null, 30],
);
check(
  'a NaN reading follows the gaps policy like any other hole',
  alignSeriesValues([10, NaN, 30], 3, 'zero'),
  [10, 0, 30],
);
check(
  'domainMaxOf skips an Infinity reading',
  domainMaxOf([[10, Infinity, 30]]),
  30,
);
check('domainMaxOf skips a NaN reading', domainMaxOf([[10, NaN, 30]]), 30);
check(
  'a reading beside an Infinity keeps its own height',
  domainMaxOf([[10, Infinity]]),
  10,
);
check(
  'valueY on a NaN reading stays on the baseline',
  valueY(NaN, 100, plot),
  290,
);
check(
  'valueY on a NaN axis max stays on the baseline',
  valueY(50, NaN, plot),
  290,
);
check(
  'valueY on an Infinity axis max stays on the baseline',
  valueY(Infinity, Infinity, plot),
  290,
);
check('valueY never leaves the plot above', valueY(1e9, 100, plot), plot.top);
check('valueY never leaves the plot below', valueY(-1e9, 100, plot), 290);
check(
  'polylinePoints refuses a poisoned coordinate',
  polylinePoints([point(10, 20), point(NaN, 40)]),
  '',
);
check(
  'polylinePoints refuses an infinite coordinate',
  polylinePoints([point(10, 20), point(30, Infinity)]),
  '',
);
check(
  'polylinePoints of a clean segment is a points list',
  polylinePoints([point(10, 20), point(30, 40.125)]),
  '10,20 30,40.13',
);
check('linePath of nothing is an empty path', linePath([], 'linear'), '');
check(
  'linePath of one point is a move alone',
  linePath([point(0, 10)], 'linear'),
  'M 0,10',
);
check(
  'linear joins the points',
  linePath([point(0, 10), point(10, 20)], 'linear'),
  'M 0,10 L 10,20',
);
check(
  'step holds the value to the next x',
  linePath([point(0, 10), point(10, 20)], 'step'),
  'M 0,10 H 10 V 20',
);
// Two points have one secant, so the monotone tangents are that slope at both ends and the cubic
// IS the straight line. A curve mode that bends a two-point series is reading a shape out of a
// single reading pair.
check(
  'smooth of two points is the straight line written as a cubic',
  linePath([point(0, 10), point(10, 20)], 'smooth'),
  'M 0,10 C 3.33,13.33 6.67,16.67 10,20',
);
// The property the mode exists for: a Catmull-Rom through these three dips below 10, drawing a
// trough the data never reaches. Every control point stays inside the readings.
check(
  'smooth never steers below a local minimum',
  linePath([point(0, 20), point(10, 10), point(20, 20)], 'smooth')
    .match(/-?\d+(?:\.\d+)?,(-?\d+(?:\.\d+)?)/g)
    .map((pair) => Number(pair.split(',')[1]))
    .every((y) => y <= 20 && y >= 10),
  true,
);
check(
  'linePath refuses a poisoned coordinate',
  linePath([point(10, 20), point(NaN, 40)], 'linear'),
  '',
);
check(
  'linePath refuses an infinite coordinate',
  linePath([point(10, 20), point(30, Infinity)], 'smooth'),
  '',
);
check(
  'an area follows its own line, so the fill and the stroke share an edge',
  areaPath([point(0, 10), point(10, 20)], 100, 'smooth'),
  'M 0,10 C 3.33,13.33 6.67,16.67 10,20 L 10,100 L 0,100 Z',
);
check(
  'areaPath refuses a poisoned baseline',
  areaPath([point(10, 20), point(30, 40)], NaN),
  '',
);
check(
  'areaPath refuses a poisoned coordinate',
  areaPath([point(10, 20), point(NaN, 40)], 100),
  '',
);
check(
  'areaPath closes a clean segment on its baseline',
  areaPath([point(10, 20), point(30, 40)], 100),
  'M 10,20 L 30,40 L 30,100 L 10,100 Z',
);
check(
  'areaPath needs two points to enclose anything',
  areaPath([point(10, 20)], 100),
  '',
);
check(
  'a poisoned series reaches the DOM with no NaN in it',
  seriesPoints(
    alignSeriesValues([10, NaN, Infinity, 30], 4, 'break'),
    100,
    plot,
    categoryCenters(4, plot),
  )
    .filter((entry) => entry !== null)
    .every((entry) => noDigitsLost(`${entry.x},${entry.y}`)),
  true,
);
check('a NaN tick count falls back to the default', normalizeTickCount(NaN), 5);
check(
  'a NaN tick count still produces an axis',
  axisLayout(PRIMARY_PEAK, null, 'aligned', NaN).primary.ticks,
  PRIMARY_TICKS,
);
check(
  'an Infinity tick count still produces an axis',
  axisLayout(PRIMARY_PEAK, null, 'aligned', Infinity).primary.ticks,
  PRIMARY_TICKS,
);
check(
  'an Infinity domain produces a single tick',
  axisLayout(Infinity, null, 'aligned', 5).primary.ticks,
  [0],
);
check(
  'a NaN domain produces a single tick',
  axisLayout(NaN, null, 'aligned', 5).primary.ticks,
  [0],
);

// ------------------------------------------------------- an empty series list
check('no series means no domain', domainMaxOf([]), 0);
check(
  'no series still produces an axis',
  axisLayout(domainMaxOf([]), null, 'aligned', 5).primary,
  { max: 0, ticks: [0] },
);
check(
  'no series leaves the secondary axis alone',
  axisLayout(domainMaxOf([]), null, 'aligned', 5).secondary,
  null,
);
check('no categories means no positions', categoryCenters(0, plot), []);
check(
  'a NaN category count means no positions',
  categoryCenters(NaN, plot),
  [],
);

// A degenerate secondary domain shares the gridlines but must not label six of
// them "0" — six identical labels stacked up the plot say nothing at all.
check(
  'a zero secondary domain collapses to one tick',
  axisLayout(PRIMARY_PEAK, 0, 'aligned', 5).secondary.ticks,
  [0],
);
check(
  'a zero secondary domain in exact mode collapses to one tick',
  axisLayout(PRIMARY_PEAK, 0, 'exact', 5).secondary.ticks,
  [0],
);
// A domain that survives `> 0` and still divides to nothing: the step underflows and
// every tick multiplies out to the same zero.
check(
  'a secondary domain too small to divide collapses to one tick',
  axisLayout(PRIMARY_PEAK, Number.MIN_VALUE, 'exact', 5).secondary.ticks,
  [0],
);
// And the other end: a finite domain whose rounded step multiplies back out past the
// largest number there is. `Infinity.toFixed()` is the string "Infinity", so an
// unguarded tick would print that as an axis label.
check(
  'a secondary domain at the top of the number range still ticks finitely',
  axisLayout(PRIMARY_PEAK, 1.7e308, 'aligned', 5).secondary.ticks.every(
    (tick) => Number.isFinite(tick),
  ),
  true,
);

// ------------------------------------------------------- positions and colour
// A line is a run between its first and last reading, so those two sit ON the axes rather than
// half a slot inside them: an empty strip against each axis reads as data the chart is withholding.
check('the first and last readings sit on the axes', categoryCenters(2, plot), [
  plot.left,
  plot.left + plot.width,
]);
check('readings in between divide the run evenly', categoryCenters(3, plot), [
  plot.left,
  plot.left + plot.width / 2,
  plot.left + plot.width,
]);
check('a single category sits in the middle', categoryCenters(1, plot), [
  plot.left + plot.width / 2,
]);
check(
  'a fractional category count does not invent a band',
  categoryCenters(2.7, plot).length,
  2,
);
check('a slot picks its own palette colour', paletteIndexFor(3, 0, 8), 2);
check(
  'no slot falls back to the position',
  paletteIndexFor(undefined, 4, 8),
  4,
);
check('a zero slot is not a palette index', paletteIndexFor(0, 4, 8), 4);
check('a NaN slot is not a palette index', paletteIndexFor(NaN, 4, 8), 4);
check('a slot past the palette wraps', paletteIndexFor(9, 0, 8), 0);
check('a position past the palette wraps', paletteIndexFor(undefined, 9, 8), 1);
check(
  'hiding a series leaves the others on their own colours',
  [paletteIndexFor(1, 0, 8), paletteIndexFor(3, 1, 8)],
  [0, 2],
);
check('few categories keep every label', categoryLabelStride(6), 1);
check('many categories thin the labels out', categoryLabelStride(60), 5);
check('no categories still return a usable stride', categoryLabelStride(0), 1);

finish('line-chart-math');
