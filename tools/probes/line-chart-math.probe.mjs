import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { registerComponentsFacade } from './register-components-facade.mjs';
import { check, finish } from './probe-check.mjs';

const components = registerComponentsFacade(import.meta.url, [
  'charts-scale.ts',
  'charts-format.ts',
  'charts-path.ts',
]);

const { alignSeriesValues, domainMaxOf, paletteIndexFor } = await import(
  pathToFileURL(join(components, 'line-chart', 'line-chart.math.ts')).href
);

const { areaPath, bandPath, lineSegments, linePath } = await import(
  pathToFileURL(join(components, 'charts-path.ts')).href);

const point = (x, y) => ({ categoryIndex: 0, x, y, value: 1 });
const noDigitsLost = (text) => !/NaN|Infinity|undefined/.test(text);

// The mark is an Angular component and cannot be imported here, so the segment assertions feed
// `lineSegments` the shape `g[dsLineSeries]` produces rather than the producer.
const pointsFrom = (values) =>
  values.map((value, categoryIndex) =>
    value === null
      ? null
      : { categoryIndex, x: categoryIndex * 10, y: 100 - value, value },
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
  lineSegments(pointsFrom(alignSeriesValues(withHole, 3, 'break'))).length,
  2,
);
check(
  'zero keeps the line in one piece',
  lineSegments(pointsFrom(alignSeriesValues(withHole, 3, 'zero'))).length,
  1,
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
  lineSegments(pointsFrom(alignSeriesValues([1, 2], 3, 'break'))).length,
  1,
);
check(
  'a series against no categories draws nothing',
  alignSeriesValues([1, 2, 3], 0, 'break'),
  [],
);

// -------------------------------------------------------- an all-null series
const allNull = [null, null, null];

check(
  'an all-null series has no readings',
  alignSeriesValues(allNull, 3, 'break'),
  [null, null, null],
);
check(
  'an all-null series has no segments',
  lineSegments(pointsFrom(alignSeriesValues(allNull, 3, 'break'))),
  [],
);
check('an all-null series has no domain', domainMaxOf([allNull]), 0);
check(
  'an all-null series emits no path',
  areaPath(
    lineSegments(pointsFrom(alignSeriesValues(allNull, 3, 'break')))[0] ?? [],
    100,
  ),
  '',
);
check(
  'an all-null series at gaps=zero draws a flat line',
  pointsFrom(alignSeriesValues(allNull, 3, 'zero')).map((entry) => entry.y),
  [100, 100, 100],
);

// ---------------------------------------------------------- NaN and Infinity
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
  'a poisoned series reaches the DOM with no NaN in it',
  pointsFrom(alignSeriesValues([10, NaN, Infinity, 30], 4, 'break'))
    .filter((entry) => entry !== null)
    .every((entry) => noDigitsLost(`${entry.x},${entry.y}`)),
  true,
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
  'a band closes along its lower edge, not along the baseline',
  bandPath(
    [point(0, 10), point(10, 20)],
    [point(0, 40), point(10, 50)],
    'linear',
  ),
  'M 0,10 L 10,20 L 10,50 L 0,40 Z',
);
// The lower edge is walked backwards, so a curved band's two edges have to be curved in opposite
// directions: reusing the forward path would close the shape along a curve bending the wrong way.
check(
  'a curved band curves both of its edges',
  bandPath(
    [point(0, 10), point(10, 20)],
    [point(0, 40), point(10, 50)],
    'smooth',
  ),
  'M 0,10 C 3.33,13.33 6.67,16.67 10,20 L 10,50 C 6.67,46.67 3.33,43.33 0,40 Z',
);
check(
  'a band of one reading encloses nothing',
  bandPath([point(0, 10)], [point(0, 40)], 'linear'),
  '',
);
check(
  'a band refuses a poisoned edge',
  bandPath(
    [point(0, 10), point(10, 20)],
    [point(0, 40), point(NaN, 50)],
    'linear',
  ),
  '',
);
check(
  'a band refuses edges of different lengths',
  bandPath([point(0, 10), point(10, 20)], [point(0, 40)], 'linear'),
  '',
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

// ------------------------------------------------------- an empty series list
check('no series means no domain', domainMaxOf([]), 0);

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

finish('line-chart-math');
