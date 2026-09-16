import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { registerComponentsFacade } from './register-components-facade.mjs';
import { formatTick } from '../../src/lib/components/charts-format.ts';
import {
  niceDomain,
  tickStep,
  tickValues,
} from '../../src/lib/components/charts-scale.ts';
import { check, finish } from './probe-check.mjs';

const components = registerComponentsFacade(import.meta.url, [
  'charts-scale.ts',
]);
const { heightPercent, resolveDomainMax, resolveDomainMin } = await import(
  pathToFileURL(join(components, 'column-chart', 'column-chart.math.ts')).href
);

// A normal dataset: the axis is niced from the largest value, the tallest column
// reaches the top gridline, the rest take their share.
check(
  'resolveDomainMax takes the largest value',
  resolveDomainMax([40, 45, 50]),
  50,
);
check(
  'resolveDomainMin keeps a zero floor for positive data',
  resolveDomainMin([40, 45, 50]),
  0,
);
check('heightPercent fills the tallest column', heightPercent(50, 0, 50), 100);
check('heightPercent is proportional', heightPercent(40, 0, 50), 80);

// All zeros: the whole series is degenerate, and 0 / 0 is NaN.
check('an all-zero series has no domain', resolveDomainMax([0, 0, 0]), 0);
check(
  'an all-zero series draws no column',
  heightPercent(0, 0, niceDomain(0, resolveDomainMax([0, 0, 0]), 5).max),
  0,
);

// An empty series has no largest value to pick, and Math.max() of nothing is -Infinity.
check('resolveDomainMax of an empty series is zero', resolveDomainMax([]), 0);
check('resolveDomainMin of an empty series is zero', resolveDomainMin([]), 0);

// A negative datum pulls the floor down with it, rather than being ignored.
check(
  'resolveDomainMax ignores a negative beside a positive',
  resolveDomainMax([40, -10, 100]),
  100,
);
check(
  'resolveDomainMin reaches below zero',
  resolveDomainMin([40, -10, 100]),
  -10,
);
check(
  'heightPercent of the floor itself sits at the plot floor',
  heightPercent(-10, -10, 100),
  0,
);

// An all-negative series keeps its own domain: the least negative value is the
// ceiling, the most negative is the floor, and the column between them is real —
// the defect this task fixes is that this series used to draw nothing at all.
check(
  'resolveDomainMax of an all-negative series',
  resolveDomainMax([-10, -5]),
  -5,
);
check(
  'resolveDomainMin of an all-negative series',
  resolveDomainMin([-10, -5]),
  -10,
);
check(
  'an all-negative series still draws a column at its floor',
  heightPercent(-10, -10, -5),
  0,
);
check(
  'the least negative value in an all-negative series reaches the ceiling',
  heightPercent(-5, -10, -5),
  100,
);

// A value outside its own domain is a defensive case, not a real one — resolveDomainMin/Max
// always derive the domain from the same data — but the clamp is what pins an all-negative
// series's invisible zero baseline to the plot's own ceiling rather than letting it run past it.
check(
  'heightPercent clamps a value below the domain floor to zero',
  heightPercent(-20, -10, 100),
  0,
);
check(
  'heightPercent clamps a value above the domain ceiling to full',
  heightPercent(150, -10, 100),
  100,
);

// NaN: Math.max(NaN, 0) is NaN, so the lower clamp alone lets `height: NaN%` through.
check('resolveDomainMax skips a NaN point', resolveDomainMax([10, NaN, 20]), 20);
check(
  'resolveDomainMin skips a NaN point',
  resolveDomainMin([10, NaN, -20]),
  -20,
);
check('heightPercent on a NaN value is zero', heightPercent(NaN, 0, 200), 0);
check('heightPercent on a NaN axis max is zero', heightPercent(50, 0, NaN), 0);

// Infinity is the point that would make the chart LIE: it would become the domain,
// so its own height came out NaN while every honest column beside it collapsed to
// 0% and went on printing its correct number.
check(
  'resolveDomainMax skips an Infinity point',
  resolveDomainMax([10, Infinity]),
  10,
);
check(
  'resolveDomainMin skips a -Infinity point',
  resolveDomainMin([10, -Infinity]),
  0,
);
check(
  'heightPercent on an Infinity value is zero',
  heightPercent(Infinity, 0, 10),
  0,
);
check(
  'a column beside an Infinity column keeps its own height',
  heightPercent(
    10,
    0,
    niceDomain(0, resolveDomainMax([10, Infinity]), 5).max,
  ),
  100,
);

// The tick scale. A domain of 1800 is not a round number of ticks, so the axis
// rounds up to 2000 and the tallest column stops below the top gridline.
const domainMin = resolveDomainMin([420, 1120, 1800]);
const domainMax = resolveDomainMax([420, 1120, 1800]);
const axis = niceDomain(domainMin, domainMax, 5);
const ticks = tickValues(domainMin, domainMax, 5);

check('the axis is niced above the domain', axis.max, 2000);
check('the ticks step in round numbers', ticks, [0, 500, 1000, 1500, 2000]);
check('tickStep reads the distance between two ticks', tickStep(ticks), 500);
// The trailing 100 is the assertion that the top tick and the top of the axis are
// the same number: the component nices both from one domain, and a gridline drawn
// anywhere but the ceiling would leave the tallest column ending off the scale.
check(
  'gridlines are evenly spaced from the floor to the ceiling',
  ticks.map((tick) => heightPercent(tick, axis.min, axis.max)),
  [0, 25, 50, 75, 100],
);
check(
  'the tallest column stops below the top gridline',
  heightPercent(domainMax, axis.min, axis.max),
  90,
);
check(
  'tick labels follow the step, not the value',
  ticks.map((tick) => formatTick(tick, tickStep(ticks))),
  ['0', '500', '1.0K', '1.5K', '2.0K'],
);

// A P&L series: the domain crosses zero, and the baseline sits inside the plot
// rather than at its floor.
const plMin = resolveDomainMin([-120, 40, -30, 80]);
const plMax = resolveDomainMax([-120, 40, -30, 80]);
const plAxis = niceDomain(plMin, plMax, 5);
const plZero = heightPercent(0, plAxis.min, plAxis.max);

check('a P&L series keeps a floor below zero', plMin, -120);
check('the zero baseline sits inside the plot', plZero > 0 && plZero < 100, true);
check(
  'a loss grows down from the baseline, not from the plot floor',
  heightPercent(-120, plAxis.min, plAxis.max) < plZero,
  true,
);

finish('column-chart-math');
