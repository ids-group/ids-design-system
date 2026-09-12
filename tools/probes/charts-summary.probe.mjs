import { register } from 'node:module';

// node --experimental-strip-types cannot resolve charts-summary.ts's own extensionless
// import of "./charts-format" (nodejs/node#61229); retry such a failure with ".ts" appended
// rather than adding the extension to the source import charts-summary.ts is required to keep.
const resolveExtensionlessTypeScript = `
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('.') && !specifier.endsWith('.ts')) {
      return nextResolve(specifier + '.ts', context);
    }
    throw error;
  }
}
`;
register(
  `data:text/javascript,${encodeURIComponent(resolveExtensionlessTypeScript)}`,
  import.meta.url,
);

const { describeSeries } = await import(
  new URL('../../src/lib/components/charts-summary.ts', import.meta.url).href
);
const { formatValue } = await import(
  new URL('../../src/lib/components/charts-format.ts', import.meta.url).href
);

let failures = 0;
const check = (name, actual, expected) => {
  if (actual !== expected) {
    failures++;
    console.error(`FAIL ${name}\n  expected ${expected}\n  actual   ${actual}`);
  } else console.log(`ok   ${name}`);
};

const points = [
  { label: 'Sep', value: 1620 },
  { label: 'Oct', value: 2110 },
  { label: 'Nov', value: 2410 },
];

// Pin the locale. The default formatter follows the machine's, so a bare
// describeSeries() asserts different digits on a de-DE box than on an en-US one.
const englishFormat = (value) => formatValue(value, 'en-US');

check(
  'describes a series',
  describeSeries('Visits by month', points, englishFormat),
  'Visits by month. 3 points, from 1,620 at Sep to 2,410 at Nov. Lowest 1,620 at Sep, highest 2,410 at Nov.',
);

check(
  'handles a single point',
  describeSeries('Visits', [{ label: 'Sep', value: 5 }], englishFormat),
  'Visits. 1 point: 5 at Sep.',
);

check(
  'handles no points',
  describeSeries('Visits', [], englishFormat),
  'Visits. No data.',
);

// Exercises the default parameter without pinning digits to any one locale.
check(
  'defaults to formatValue',
  describeSeries('Visits by month', points),
  describeSeries('Visits by month', points, formatValue),
);

// A host formatter must reach the screen-reader sentence, not only the visible labels.
check(
  'honours a host formatter',
  describeSeries(
    'Revenue',
    [{ label: 'Sep', value: 1620 }],
    (value) => `£${value}`,
  ),
  'Revenue. 1 point: £1620 at Sep.',
);

// The brief's own series has its minimum first and its maximum last, so it cannot tell
// "lowest" apart from "first" nor "highest" apart from "last". This series puts both
// extremes in the middle, where only a correct reduce can find them.
const middleExtremes = [
  { label: 'Jan', value: 500 },
  { label: 'Feb', value: 100 },
  { label: 'Mar', value: 900 },
  { label: 'Apr', value: 300 },
];

check(
  'distinguishes lowest and highest from first and last',
  describeSeries('Quarterly', middleExtremes, englishFormat),
  'Quarterly. 4 points, from 500 at Jan to 300 at Apr. Lowest 100 at Feb, highest 900 at Mar.',
);

// Same series, a formatter with a distinct shape ($ instead of a plain number) so a bypass
// of the format parameter on any one of first/last/lowest/highest shows up as a mismatch.
check(
  'host formatter reaches every value in a multi-point series',
  describeSeries('Quarterly', middleExtremes, (value) => `$${value}`),
  'Quarterly. 4 points, from $500 at Jan to $300 at Apr. Lowest $100 at Feb, highest $900 at Mar.',
);

if (failures) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log('\ncharts-summary: all assertions passed');
