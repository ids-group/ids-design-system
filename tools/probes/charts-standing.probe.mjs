import { registerHooks } from 'node:module';
import { check, finish } from './probe-check.mjs';

// `charts-format.ts` imports nothing, so no resolve hook is needed — registerHooks is here only to
// keep the import shape identical to the other chart probes.
registerHooks({});

const { describeStanding } = await import(
  new URL('../../src/lib/components/charts-format.ts', import.meta.url).href
);

check(
  'names the share of the total and the rank',
  describeStanding([50, 30, 20], 0),
  '50.0% of total · 1st of 3',
);
check(
  'ranks a middle mark',
  describeStanding([50, 30, 20], 1),
  '30.0% of total · 2nd of 3',
);
check(
  'ranks the last',
  describeStanding([50, 30, 20], 2),
  '20.0% of total · 3rd of 3',
);

// A single mark stands among nothing, and a tooltip saying "1st of 1" is noise.
check('a lone mark has no standing', describeStanding([42], 0), '');

// Ties share a rank rather than being ordered arbitrarily: two 30s are both second.
check(
  'a tie shares the rank',
  describeStanding([50, 30, 30], 1),
  '27.3% of total · 2nd of 3',
);
check(
  'a tie shares the rank, both ways',
  describeStanding([50, 30, 30], 2),
  '27.3% of total · 2nd of 3',
);

// The teens break the last-digit rule for ordinals, which is the one place this goes wrong.
const twenty = Array.from({ length: 20 }, (unused, index) => 20 - index);
check(
  '11th, not 11st',
  describeStanding(twenty, 10),
  '4.8% of total · 11th of 20',
);
check(
  '12th, not 12nd',
  describeStanding(twenty, 11),
  '4.3% of total · 12th of 20',
);
check(
  '13th, not 13rd',
  describeStanding(twenty, 12),
  '3.8% of total · 13th of 20',
);
check(
  '21st keeps the last-digit rule',
  describeStanding(
    Array.from({ length: 25 }, (u, i) => 25 - i),
    20,
  ),
  '1.5% of total · 21st of 25',
);

// A negative reading is not a share of anything a reader can see, so the total excludes it and the
// mark falls back to its rank alone.
check(
  'a negative mark keeps its rank only',
  describeStanding([50, -30, 20], 1),
  '3rd of 3',
);
check(
  'a zero mark keeps its rank only',
  describeStanding([50, 0, 20], 1),
  '3rd of 3',
);
check(
  'a non-finite mark has no standing',
  describeStanding([50, Number.NaN, 20], 1),
  '',
);

finish('charts-standing');
