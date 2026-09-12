import {
  linearScale,
  bandScale,
  ticks,
  niceMax,
} from '../../src/lib/components/charts-scale.ts';

let failures = 0;
const check = (name, actual, expected) => {
  const a = JSON.stringify(actual),
    e = JSON.stringify(expected);
  if (a !== e) {
    failures++;
    console.error(`FAIL ${name}\n  expected ${e}\n  actual   ${a}`);
  } else console.log(`ok   ${name}`);
};

check(
  'ticks picks a round step',
  ticks(2410, 5),
  [0, 500, 1000, 1500, 2000, 2500],
);
check('ticks on a small domain', ticks(75, 5), [0, 20, 40, 60, 80]);
check('niceMax rounds up', niceMax(2410, 5), 2500);
check('niceMax leaves a round max alone', niceMax(2500, 5), 2500);

// 2410 and 75 both land on factor 5 or 2 — factor 1 and factor 10 need their own domains.
check(
  'ticks lands on factor 1',
  ticks(650, 5),
  [0, 100, 200, 300, 400, 500, 600, 700],
);
check('ticks lands on factor 10', ticks(4000, 5), [0, 1000, 2000, 3000, 4000]);
// domain = sqrt(50) makes error equal E10 bit-for-bit, the one point where >= and > diverge.
check(
  'ticks at the exact factor-10/factor-5 tie',
  ticks(Math.sqrt(50), 1),
  [0, 10],
);

// A zero or negative domain must not divide by zero or emit NaN.
check('zero domain yields a single tick', ticks(0, 5), [0]);
check('negative domain is clamped', ticks(-10, 5), [0]);
// Neither must a non-finite one — <= 0 alone lets NaN and Infinity both through.
check('NaN domain yields a single tick', ticks(NaN, 5), [0]);
check('Infinity domain yields a single tick', ticks(Infinity, 5), [0]);
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
check(
  'linearScale on an Infinity domain does not divide by zero',
  linearScale(Infinity, 200)(5),
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
check('ticks clamps a non-positive targetCount to 1', ticks(100, 0), [0, 100]);

if (failures) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log('\ncharts-scale: all assertions passed');
