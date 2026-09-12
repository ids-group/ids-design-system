import {
  formatValue,
  formatPercent,
  largestRemainder,
  formatTick,
} from '../../src/lib/components/charts-format.ts';

let failures = 0;
const check = (name, actual, expected) => {
  const a = JSON.stringify(actual),
    e = JSON.stringify(expected);
  if (a !== e) {
    failures++;
    console.error(`FAIL ${name}\n  expected ${e}\n  actual   ${a}`);
  } else console.log(`ok   ${name}`);
};

check('formatValue groups thousands', formatValue(55910, 'en-US'), '55,910');
check('formatValue leaves small numbers alone', formatValue(75, 'en-US'), '75');
// Neither NaN nor Infinity is a value the Intl formatter should ever see.
check('formatValue guards a NaN value', formatValue(NaN, 'en-US'), '—');
check(
  'formatValue guards an infinite value',
  formatValue(Infinity, 'en-US'),
  '—',
);
// No locale argument at all still has to format, using the runtime default.
check(
  'formatValue defaults the locale when omitted',
  formatValue(1000),
  new Intl.NumberFormat().format(1000),
);
// Two distinct locales must not share a cached formatter.
check(
  'formatValue formats en-US with commas',
  formatValue(1234567, 'en-US'),
  '1,234,567',
);
check(
  'formatValue formats de-DE with periods',
  formatValue(1234567, 'de-DE'),
  '1.234.567',
);

check('formatPercent rounds to one place', formatPercent(1961, 3204), '61.2%');
check('formatPercent guards a zero total', formatPercent(5, 0), '—');
// A share too small for one decimal must not print as a flat zero — 214 of 987,654,321 sits on
// the docs page beside a bar too short to see, and "0.0%" would read as nothing at all.
check('formatPercent marks a share below one decimal', formatPercent(214, 987654321), '<0.1%');
check('formatPercent still prints a real zero as zero', formatPercent(0, 100), '0.0%');
check('formatPercent guards a non-finite value', formatPercent(NaN, 100), '—');
check(
  'formatPercent guards a non-finite total',
  formatPercent(50, Infinity),
  '—',
);

// Three shares that each round to 33.3 must still sum to 100, not 99.9.
check(
  'largestRemainder sums to 100',
  largestRemainder([1, 1, 1]).reduce((a, b) => a + b, 0),
  100,
);
check(
  'largestRemainder keeps order',
  largestRemainder([50, 30, 20]),
  [50, 30, 20],
);
check(
  'largestRemainder guards a zero total',
  largestRemainder([0, 0, 0]),
  [0, 0, 0],
);
// Tied fractions redistribute to the first index, by the stability of the sort.
check(
  'largestRemainder redistributes a tied fraction to the first index',
  largestRemainder([1, 1, 1]),
  [34, 33, 33],
);
// Untied fractions redistribute to the largest fraction, not the first index.
check(
  'largestRemainder redistributes to the largest fraction first',
  largestRemainder([1, 2, 4]),
  [14, 29, 57],
);
// Seven equal shares floor to 14 each (98 total), leaving a remainder of 2 — the only
// case among the assertions above where more than one index needs bumping.
check(
  'largestRemainder redistributes a remainder of two or more',
  largestRemainder([1, 1, 1, 1, 1, 1, 1]),
  [15, 15, 14, 14, 14, 14, 14],
);

// The tick label's precision follows the step, not the value: a step of 500 puts every
// label on one decimal, so 2500 reads 2.5K and 2000 reads 2.0K.
check('formatTick uses the step for precision', formatTick(2500, 500), '2.5K');
check('formatTick below a thousand', formatTick(80, 20), '80');
check('formatTick guards a NaN value', formatTick(NaN, 500), '');
check('formatTick guards an infinite value', formatTick(Infinity, 500), '');
// A step that divides 1000 evenly reads as whole thousands, not one decimal.
check(
  'formatTick treats a step dividing 1000 evenly as whole thousands',
  formatTick(2000, 1000),
  '2K',
);

if (failures) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log('\ncharts-format: all assertions passed');
