import {
  linearScale,
  bandScale,
  tickValues,
  niceDomain,
  domainMinOf,
} from '../../src/lib/components/charts-scale.ts';
import { check, finish } from './probe-check.mjs';

check(
  'tickValues picks a round step',
  tickValues(0, 2410, 5),
  [0, 500, 1000, 1500, 2000, 2500],
);
check(
  'tickValues on a small domain',
  tickValues(0, 75, 5),
  [0, 20, 40, 60, 80],
);
check('niceMax rounds up', niceDomain(0, 2410, 5).max, 2500);
check('niceMax leaves a round max alone', niceDomain(0, 2500, 5).max, 2500);

// 2410 and 75 both land on factor 5 or 2 — factor 1 and factor 10 need their own domains.
check(
  'tickValues lands on factor 1',
  tickValues(0, 650, 5),
  [0, 100, 200, 300, 400, 500, 600, 700],
);
check(
  'tickValues lands on factor 10',
  tickValues(0, 4000, 5),
  [0, 1000, 2000, 3000, 4000],
);
// domain = sqrt(50) makes error equal E10 bit-for-bit, the one point where >= and > diverge.
check(
  'tickValues at the exact factor-10/factor-5 tie',
  tickValues(0, Math.sqrt(50), 1),
  [0, 10],
);

// A zero or inverted domain must not divide by zero or emit NaN.
check('zero domain yields a single tick', tickValues(0, 0, 5), [0]);
check('inverted domain is clamped', tickValues(0, -10, 5), [0]);
// Neither must a non-finite one — <= 0 alone lets NaN and Infinity both through.
check('NaN domain yields a single tick', tickValues(0, NaN, 5), [0]);
check('Infinity domain yields a single tick', tickValues(0, Infinity, 5), [0]);
check('NaN domain niceMax is zero', niceDomain(0, NaN, 5).max, 0);
check('Infinity domain niceMax is zero', niceDomain(0, Infinity, 5).max, 0);

const scale = linearScale(0, 2500, 200);
check('linearScale maps zero to zero', scale(0), 0);
check('linearScale maps the max to the range', scale(2500), 200);
check('linearScale is linear', scale(1250), 100);
check(
  'linearScale on a zero domain does not divide by zero',
  linearScale(0, 0, 200)(0),
  0,
);
check(
  'linearScale on a NaN domain does not divide by zero',
  linearScale(0, NaN, 200)(5),
  0,
);
// Infinity as the VALUE, not just as the domain: 5 / Infinity is 0 with or without
// the guard, so a finite value here proves nothing. Infinity / Infinity is NaN.
check(
  'linearScale on an Infinity domain does not emit NaN',
  linearScale(0, Infinity, 200)(Infinity),
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
  tickValues(0, 100, 0),
  [0, 100],
);

check('bandScale reports its step', band.step, 100);
check('bandScale reports its count', band.count, 4);
check('indexAt finds the first band', band.indexAt(0), 0);
check('indexAt stays inside a band', band.indexAt(99.9), 0);
check('indexAt crosses to the next band', band.indexAt(100), 1);
check('indexAt clamps past the end', band.indexAt(400), 3);
check('indexAt clamps before the start', band.indexAt(-5), 0);
check(
  'indexAt of an empty scale is minus one',
  bandScale(0, 400, 0.2).indexAt(50),
  -1,
);

check('domainMinOf keeps a zero floor for positive data', domainMinOf([40, 80]), 0);
check('domainMinOf reaches below zero', domainMinOf([-120, 40, 80]), -120);
check('domainMinOf of nothing is zero', domainMinOf([]), 0);

check('linearScale maps a two-ended domain', linearScale(-50, 150, 200)(0), 50);
check('linearScale puts the minimum at zero', linearScale(-50, 150, 200)(-50), 0);
check('linearScale puts the maximum at the range end', linearScale(-50, 150, 200)(150), 200);

check('niceDomain rounds both ends outward', niceDomain(-42, 150, 5), { min: -50, max: 150 });
check('niceDomain leaves a zero floor alone', niceDomain(0, 2410, 5), { min: 0, max: 2500 });

check('tickValues spans a negative domain', tickValues(-50, 150, 5), [-50, 0, 50, 100, 150]);
check('tickValues is unchanged for a zero floor', tickValues(0, 2410, 5), [0, 500, 1000, 1500, 2000, 2500]);

finish('charts-scale');
