import { registerHooks } from 'node:module';
import { check, finish } from './probe-check.mjs';

// `charts-format.ts` imports nothing, so no resolve hook is needed — registerHooks is here only to
// keep the import shape identical to the other chart probes.
registerHooks({});

const { describeShare, shareOfTotal } = await import(
  new URL('../../src/lib/components/charts-format.ts', import.meta.url).href
);

const phrase = (share) => `${share} of total`;

check(
  'names the share of the total',
  describeShare([50, 30, 20], 0, 'en-US', phrase),
  '50.0% of total',
);
check(
  'the middle mark',
  describeShare([50, 30, 20], 1, 'en-US', phrase),
  '30.0% of total',
);
check(
  'the last mark',
  describeShare([50, 30, 20], 2, 'en-US', phrase),
  '20.0% of total',
);

// A single mark is the whole total, so "100.0% of total" says nothing the reader cannot see.
check('a lone mark has no share', describeShare([42], 0, 'en-US', phrase), '');

// A tie is two equal shares, not an order.
check(
  'a tie shares the figure',
  describeShare([50, 30, 30], 1, 'en-US', phrase),
  '27.3% of total',
);
check(
  'a tie shares the figure, both ways',
  describeShare([50, 30, 30], 2, 'en-US', phrase),
  '27.3% of total',
);

// A negative reading is not a share of anything a reader can see, so the total excludes it and the
// mark itself has no share to print.
check(
  'a negative mark has no share',
  describeShare([50, -30, 20], 1, 'en-US', phrase),
  '',
);
check(
  'a zero mark has no share',
  describeShare([50, 0, 20], 1, 'en-US', phrase),
  '',
);
check(
  'a non-finite mark has no share',
  describeShare([50, Number.NaN, 20], 1, 'en-US', phrase),
  '',
);

// A positive mark whose only sibling is negative is the whole of the total it can be a share of.
check(
  'the only positive is all of it',
  describeShare([10, -5], 0, 'en-US', phrase),
  '100.0% of total',
);
check(
  'no positive mark, no total',
  describeShare([-10, -5], 0, 'en-US', phrase),
  '',
);

// The table column and the tooltip line must never disagree: one is the other without its suffix.
check(
  'the column cell is the bare percentage',
  shareOfTotal([50, 30, 20], 0, 'en-US'),
  '50.0%',
);
check('a lone mark has no share to print', shareOfTotal([42], 0, 'en-US'), '');
check(
  'a negative mark has no share',
  shareOfTotal([50, -30, 20], 1, 'en-US'),
  '',
);
check(
  'the tooltip line is the column cell plus its denominator',
  describeShare([50, 30, 20], 1, 'en-US', phrase),
  `${shareOfTotal([50, 30, 20], 1, 'en-US')} of total`,
);

finish('charts-share');
