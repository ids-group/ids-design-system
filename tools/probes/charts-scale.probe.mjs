import { linearScale, bandScale, ticks, niceMax } from '../../src/lib/components/charts-scale.ts';

let failures = 0;
const check = (name, actual, expected) => {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { failures++; console.error(`FAIL ${name}\n  expected ${e}\n  actual   ${a}`); }
  else console.log(`ok   ${name}`);
};

check('ticks picks a round step', ticks(2410, 5), [0, 500, 1000, 1500, 2000, 2500]);
check('ticks on a small domain', ticks(75, 5), [0, 20, 40, 60, 80]);
check('niceMax rounds up', niceMax(2410, 5), 2500);
check('niceMax leaves a round max alone', niceMax(2500, 5), 2500);

// A zero or negative domain must not divide by zero or emit NaN.
check('zero domain yields a single tick', ticks(0, 5), [0]);
check('negative domain is clamped', ticks(-10, 5), [0]);

const scale = linearScale(2500, 200);
check('linearScale maps zero to zero', scale(0), 0);
check('linearScale maps the max to the range', scale(2500), 200);
check('linearScale is linear', scale(1250), 100);
check('linearScale on a zero domain does not divide by zero', linearScale(0, 200)(0), 0);

const band = bandScale(4, 400, 0.2);
check('bandScale band width', Math.round(band.bandWidth), 80);
check('bandScale first position', Math.round(band.position(0)), 10);

if (failures) { console.error(`\n${failures} failure(s)`); process.exit(1); }
console.log('\ncharts-scale: all assertions passed');
