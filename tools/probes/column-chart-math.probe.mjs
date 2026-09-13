import {
  heightPercent,
  resolveDomainMax,
} from '../../src/lib/components/column-chart/column-chart.math.ts';
import { formatTick } from '../../src/lib/components/charts-format.ts';
import {
  niceMax,
  tickStep,
  tickValues,
} from '../../src/lib/components/charts-scale.ts';
import { check, finish } from './probe-check.mjs';

// A normal dataset: the axis is niced from the largest value, the tallest column
// reaches the top gridline, the rest take their share.
check(
  'resolveDomainMax takes the largest value',
  resolveDomainMax([40, 45, 50]),
  50,
);
check('heightPercent fills the tallest column', heightPercent(50, 50), 100);
check('heightPercent is proportional', heightPercent(40, 50), 80);

// All zeros: the whole series is degenerate, and 0 / 0 is NaN.
check('an all-zero series has no domain', resolveDomainMax([0, 0, 0]), 0);
check(
  'an all-zero series draws no column',
  heightPercent(0, niceMax(resolveDomainMax([0, 0, 0]), 5)),
  0,
);

// An empty series has no largest value to pick, and Math.max() of nothing is -Infinity.
check('resolveDomainMax of an empty series is zero', resolveDomainMax([]), 0);

// A negative datum would draw a column growing downwards out of the plot area.
check(
  'resolveDomainMax ignores a negative beside a positive',
  resolveDomainMax([40, -10, 100]),
  100,
);
check(
  'heightPercent clamps a negative value to zero',
  heightPercent(-10, 100),
  0,
);
// An all-negative series keeps its negative domain — the axis guard, not the
// domain, is what stops it becoming a scale.
check(
  'resolveDomainMax of an all-negative series',
  resolveDomainMax([-10, -5]),
  -5,
);
check(
  'an all-negative series draws no column',
  heightPercent(-10, niceMax(resolveDomainMax([-10, -5]), 5)),
  0,
);

// NaN: Math.max(NaN, 0) is NaN, so the lower clamp alone lets `height: NaN%` through.
check(
  'resolveDomainMax skips a NaN point',
  resolveDomainMax([10, NaN, 20]),
  20,
);
check('heightPercent on a NaN value is zero', heightPercent(NaN, 200), 0);
check('heightPercent on a NaN axis max is zero', heightPercent(50, NaN), 0);

// Infinity is the point that would make the chart LIE: it would become the domain,
// so its own height came out NaN while every honest column beside it collapsed to
// 0% and went on printing its correct number.
check(
  'resolveDomainMax skips an Infinity point',
  resolveDomainMax([10, Infinity]),
  10,
);
check(
  'heightPercent on an Infinity value is zero',
  heightPercent(Infinity, 10),
  0,
);
// There is deliberately no `heightPercent(5, Infinity)` case: a finite value over an
// Infinity axis max is 0 with or without the guard, so it would assert nothing. The
// NaN axis max above is what proves that half of the guard is load-bearing.
check(
  'a column beside an Infinity column keeps its own height',
  heightPercent(10, niceMax(resolveDomainMax([10, Infinity]), 5)),
  100,
);

// The tick scale. A domain of 1800 is not a round number of ticks, so the axis
// rounds up to 2000 and the tallest column stops below the top gridline.
const domainMax = resolveDomainMax([420, 1120, 1800]);
const axisMax = niceMax(domainMax, 5);
const ticks = tickValues(domainMax, 5);

check('the axis is niced above the domain', axisMax, 2000);
check('the ticks step in round numbers', ticks, [0, 500, 1000, 1500, 2000]);
check('tickStep reads the distance between two ticks', tickStep(ticks), 500);
// The trailing 100 is the assertion that the top tick and the top of the axis are
// the same number: the component nices both from one domain, and a gridline drawn
// anywhere but the ceiling would leave the tallest column ending off the scale.
check(
  'gridlines are evenly spaced from the floor to the ceiling',
  ticks.map((tick) => heightPercent(tick, axisMax)),
  [0, 25, 50, 75, 100],
);
check(
  'the tallest column stops below the top gridline',
  heightPercent(domainMax, axisMax),
  90,
);
check(
  'tick labels follow the step, not the value',
  ticks.map((tick) => formatTick(tick, tickStep(ticks))),
  ['0', '500', '1.0K', '1.5K', '2.0K'],
);

finish('column-chart-math');
