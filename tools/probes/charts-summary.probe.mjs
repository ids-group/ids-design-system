import { registerHooks } from 'node:module';
import { check, finish } from './probe-check.mjs';

// node --experimental-strip-types cannot resolve charts-summary.ts's own extensionless
// import of "./charts-format" (nodejs/node#61229); retry such a failure with ".ts" appended
// rather than adding the extension to the source import charts-summary.ts is required to keep.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (
        error?.code === 'ERR_MODULE_NOT_FOUND' &&
        specifier.startsWith('.') &&
        !specifier.endsWith('.ts')
      ) {
        return nextResolve(specifier + '.ts', context);
      }
      throw error;
    }
  },
});

const { describeSeries } = await import(
  new URL('../../src/lib/components/charts-summary.ts', import.meta.url).href
);
const { formatValue } = await import(
  new URL('../../src/lib/components/charts-format.ts', import.meta.url).href
);

const points = [
  { label: 'Sep', value: 1620 },
  { label: 'Oct', value: 2110 },
  { label: 'Nov', value: 2410 },
];

// Pin the locale. The default formatter follows the machine's, so a bare
// describeSeries() asserts different digits on a de-DE box than on an en-US one.
const englishFormat = (value) => formatValue(value, 'en-US');

// The ORDER is what is asserted: scale, then trend, then extremes, then the pointer. A recital of
// the encoding is what this replaced, and it is the level blind readers rank lowest.
check(
  'leads with the scale and the trend, not the encoding',
  describeSeries('Visits by month', points, englishFormat),
  'Visits by month, 3 points, 1,620 to 2,410. Rising throughout. Highest in Nov at 2,410, lowest in Sep at 1,620. Full values in the table below.',
);

check(
  'names a fall',
  describeSeries(
    'Visits by month',
    [...points].reverse(),
    englishFormat,
  ),
  'Visits by month, 3 points, 1,620 to 2,410. Falling throughout. Highest in Nov at 2,410, lowest in Sep at 1,620. Full values in the table below.',
);

// A series that ends above where it started but dips on the way is NOT "rising throughout".
check(
  'separates an overall rise from a monotonic one',
  describeSeries(
    'Visits',
    [
      { label: 'Sep', value: 100 },
      { label: 'Oct', value: 50 },
      { label: 'Nov', value: 300 },
    ],
    englishFormat,
  ),
  'Visits, 3 points, 50 to 300. Rising overall. Highest in Nov at 300, lowest in Oct at 50. Full values in the table below.',
);

check(
  'names a series that ends where it started',
  describeSeries(
    'Visits',
    [
      { label: 'Sep', value: 100 },
      { label: 'Oct', value: 50 },
      { label: 'Nov', value: 100 },
    ],
    englishFormat,
  ),
  'Visits, 3 points, 50 to 100. Ending where it started. Highest in Sep at 100, lowest in Oct at 50. Full values in the table below.',
);

// A chart rendered with `dataTable="none"` has no table, so the sentence must not promise one.
check(
  'drops the pointer when no table follows',
  describeSeries('Visits by month', points, englishFormat, false),
  'Visits by month, 3 points, 1,620 to 2,410. Rising throughout. Highest in Nov at 2,410, lowest in Sep at 1,620.',
);

check(
  'handles a single point',
  describeSeries('Visits', [{ label: 'Sep', value: 5 }], englishFormat),
  'Visits, one point: 5 at Sep. Full values in the table below.',
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
  'Revenue, one point: £1620 at Sep. Full values in the table below.',
);

// This series puts both extremes in the middle, where only a correct reduce can find them.
const middleExtremes = [
  { label: 'Jan', value: 500 },
  { label: 'Feb', value: 100 },
  { label: 'Mar', value: 900 },
  { label: 'Apr', value: 300 },
];

check(
  'finds extremes that are neither first nor last',
  describeSeries('Quarterly', middleExtremes, englishFormat),
  'Quarterly, 4 points, 100 to 900. Falling overall. Highest in Mar at 900, lowest in Feb at 100. Full values in the table below.',
);

// A formatter with a distinct shape, so a bypass of the format parameter on any one of
// scale/highest/lowest shows up as a mismatch.
check(
  'host formatter reaches every value in a multi-point series',
  describeSeries('Quarterly', middleExtremes, (value) => `$${value}`),
  'Quarterly, 4 points, $100 to $900. Falling overall. Highest in Mar at $900, lowest in Feb at $100. Full values in the table below.',
);

// Two labels tie for the minimum (100) and two for the maximum (900), neither pair at the array's
// ends. Strict "<"/">" keeps the first tied label, matching reading order, so the sentence must
// read "Tue"/"Thu" — a "<="/">=" mutation would silently read "Wed"/"Fri" instead.
const tiedExtremes = [
  { label: 'Mon', value: 500 },
  { label: 'Tue', value: 100 },
  { label: 'Wed', value: 100 },
  { label: 'Thu', value: 900 },
  { label: 'Fri', value: 900 },
  { label: 'Sat', value: 300 },
];

check(
  'breaks a tie by keeping the first occurrence',
  describeSeries('Weekly', tiedExtremes, englishFormat),
  'Weekly, 6 points, 100 to 900. Falling overall. Highest in Thu at 900, lowest in Tue at 100. Full values in the table below.',
);

finish('charts-summary');
