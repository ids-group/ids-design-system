import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { registerComponentsFacade } from './register-components-facade.mjs';
import { check, finish } from './probe-check.mjs';

const components = registerComponentsFacade(import.meta.url, []);

const { heatmapDomain, rampIndexOf } = await import(
  pathToFileURL(
    join(components, 'heatmap-chart', 'heatmap-chart.math.ts'),
  ).href
);

check('the minimum lands on the first step', rampIndexOf(0, 0, 100, 8), 0);
check('the maximum lands on the last step', rampIndexOf(100, 0, 100, 8), 7);
check('a mid value lands in the middle', rampIndexOf(50, 0, 100, 8), 3);
check('a value below the domain clamps', rampIndexOf(-10, 0, 100, 8), 0);
check('a value above the domain clamps', rampIndexOf(140, 0, 100, 8), 7);
check('a degenerate domain uses the first step', rampIndexOf(5, 5, 5, 8), 0);

// A non-finite reading must not silently paint as the coldest cell - the component draws no rect
// for it at all, and this is the value it reads to decide that.
check('a non-finite reading has no step', rampIndexOf(Number.NaN, 0, 100, 8), null);
check('one step means every reading is that step', rampIndexOf(70, 0, 100, 1), 0);

check(
  'the domain spans every reading in the matrix',
  heatmapDomain([
    { label: 'A', data: [4, 9] },
    { label: 'B', data: [1, 6] },
  ]),
  { min: 1, max: 9 },
);
check(
  'a missing reading is not a zero',
  heatmapDomain([{ label: 'A', data: [null, 12] }]),
  { min: 12, max: 12 },
);
check(
  'a matrix with no readings has a degenerate domain',
  heatmapDomain([{ label: 'A', data: [null, null] }]),
  { min: 0, max: 0 },
);
check(
  'negative readings open the domain downwards',
  heatmapDomain([{ label: 'A', data: [-8, 3] }]),
  { min: -8, max: 3 },
);

finish('heatmap-chart-math');
