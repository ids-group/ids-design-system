import {
  linearScale,
  bandScale,
  tickValues,
  niceMax,
  tickStep,
} from '../../src/lib/components/charts-scale.ts';
import { check, finish } from './probe-check.mjs';

check(
  'tickValues picks a round step',
  tickValues(2410, 5),
  [0, 500, 1000, 1500, 2000, 2500],
);
check('tickValues on a small domain', tickValues(75, 5), [0, 20, 40, 60, 80]);
check('niceMax rounds up', niceMax(2410, 5), 2500);
check('niceMax leaves a round max alone', niceMax(2500, 5), 2500);

check(
  'tickStep reads the distance between two ticks',
  tickStep(tickValues(2410, 5)),
  500,
);
// A degenerate series yields one tick, and `ticks[1] - ticks[0]` would be NaN.
check('tickStep of a single tick is zero', tickStep([0]), 0);
check('tickStep of no ticks is zero', tickStep([]), 0);

// 2410 and 75 both land on factor 5 or 2 — factor 1 and factor 10 need their own domains.
check(
  'tickValues lands on factor 1',
  tickValues(650, 5),
  [0, 100, 200, 300, 400, 500, 600, 700],
);
check(
  'tickValues lands on factor 10',
  tickValues(4000, 5),
  [0, 1000, 2000, 3000, 4000],
);
// domain = sqrt(50) makes error equal E10 bit-for-bit, the one point where >= and > diverge.
check(
  'tickValues at the exact factor-10/factor-5 tie',
  tickValues(Math.sqrt(50), 1),
  [0, 10],
);

// A zero or negative domain must not divide by zero or emit NaN.
check('zero domain yields a single tick', tickValues(0, 5), [0]);
check('negative domain is clamped', tickValues(-10, 5), [0]);
// Neither must a non-finite one — <= 0 alone lets NaN and Infinity both through.
check('NaN domain yields a single tick', tickValues(NaN, 5), [0]);
check('Infinity domain yields a single tick', tickValues(Infinity, 5), [0]);
check('NaN domain niceMax is zero', niceMax(NaN, 5), 0);
check('Infinity domain niceMax is zero', niceMax(Infinity, 5), 0);

const scale = linearScale(2500, 200);
check('linearScale maps zero to zero', scale(0), 0);
check('linearScale maps the max to the range', scale(2500), 200);
check('linearScale is linear', scale(1250), 100);
check(
  'linearScale on a zero domain does not divide by zero',
  linearScale(0, 200)(0),
  0,
);
check(
  'linearScale on a NaN domain does not divide by zero',
  linearScale(NaN, 200)(5),
  0,
);
// Infinity as the VALUE, not just as the domain: 5 / Infinity is 0 with or without
// the guard, so a finite value here proves nothing. Infinity / Infinity is NaN.
check(
  'linearScale on an Infinity domain does not emit NaN',
  linearScale(Infinity, 200)(Infinity),
  0,
);

const band = bandScale(4, 400, 0.2);
check('bandScale band width', Math.round(band.bandWidth), 80);
check('bandScale first position', Math.round(band.position(0)), 10);
check(
  'bandScale with a non-positive count yields a zero band',
  bandScale(0, 400, 0.2).bandWidth,
  0,
);
check(
  'bandScale with a non-positive count has no position offset',
  bandScale(0, 400, 0.2).position(3),
  0,
);
check(
  'tickValues clamps a non-positive targetCount to 1',
  tickValues(100, 0),
  [0, 100],
);

finish('charts-scale');
