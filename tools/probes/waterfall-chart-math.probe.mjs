import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { registerComponentsFacade } from './register-components-facade.mjs';
import { check, finish } from './probe-check.mjs';

const components = registerComponentsFacade(import.meta.url, []);

const { waterfallSteps } = await import(
  pathToFileURL(
    join(components, 'waterfall-chart', 'waterfall-chart.math.ts'),
  ).href
);

// Deck 10's own numbers, so the drawing and the code agree.
check(
  'a delta hangs from the running total',
  waterfallSteps([
    { label: 'Billed', value: 1200, kind: 'total' },
    { label: 'Commission', value: -320 },
    { label: 'Refunds', value: -210 },
    { label: 'Adjustment', value: 130 },
    { label: 'Net', value: 0, kind: 'total' },
  ]),
  [
    { label: 'Billed', from: 0, to: 1200, direction: 'total' },
    { label: 'Commission', from: 1200, to: 880, direction: 'decrease' },
    { label: 'Refunds', from: 880, to: 670, direction: 'decrease' },
    { label: 'Adjustment', from: 670, to: 800, direction: 'increase' },
    { label: 'Net', from: 0, to: 800, direction: 'total' },
  ],
);
check('an empty waterfall has no steps', waterfallSteps([]), []);
check(
  'a leading delta starts from zero',
  waterfallSteps([{ label: 'A', value: -50 }]),
  [{ label: 'A', from: 0, to: -50, direction: 'decrease' }],
);

// A subtotal stands on zero like a total but keeps the chain running past it, which is the whole
// difference between the two.
check(
  'a subtotal stands on zero and the chain continues',
  waterfallSteps([
    { label: 'A', value: 100 },
    { label: 'Half way', value: 0, kind: 'subtotal' },
    { label: 'B', value: -40 },
  ]),
  [
    { label: 'A', from: 0, to: 100, direction: 'increase' },
    { label: 'Half way', from: 0, to: 100, direction: 'total' },
    { label: 'B', from: 100, to: 60, direction: 'decrease' },
  ],
);
check(
  'a zero delta is neither an increase nor a decrease',
  waterfallSteps([{ label: 'A', value: 0 }]),
  [{ label: 'A', from: 0, to: 0, direction: 'increase' }],
);
// A non-finite reading must not poison every step after it: the running total carries on as though
// the row contributed nothing, which is what keeps the rest of the chain drawable.
check(
  'a non-finite reading contributes nothing',
  waterfallSteps([
    { label: 'A', value: 100 },
    { label: 'B', value: Number.NaN },
    { label: 'C', value: -25 },
  ]),
  [
    { label: 'A', from: 0, to: 100, direction: 'increase' },
    { label: 'B', from: 100, to: 100, direction: 'increase' },
    { label: 'C', from: 100, to: 75, direction: 'decrease' },
  ],
);

finish('waterfall-chart-math');
