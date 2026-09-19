import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { registerComponentsFacade } from './register-components-facade.mjs';
import { check, finish } from './probe-check.mjs';

const components = registerComponentsFacade(import.meta.url, ['charts-scale.ts']);

const { scatterExtent, scatterPlacement } = await import(
  pathToFileURL(join(components, 'scatter-chart', 'scatter-chart.math.ts')).href
);

const series = [
  { id: 'a', label: 'A', data: [{ x: 10, y: 100 }, { x: 30, y: 400 }] },
  { id: 'b', label: 'B', data: [{ x: 20, y: 50 }, { x: 45, y: 250 }] },
];

check('the extent spans every series on both axes', scatterExtent(series), {
  xMin: 10,
  xMax: 45,
  yMin: 50,
  yMax: 400,
});
check('no series is a degenerate extent', scatterExtent([]), {
  xMin: 0,
  xMax: 0,
  yMin: 0,
  yMax: 0,
});
// A non-finite reading is not a coordinate, so it neither widens the plot nor lands on an edge of it.
check(
  'a non-finite reading is left out of the extent',
  scatterExtent([{ id: 'a', label: 'A', data: [{ x: 10, y: 100 }, { x: Number.NaN, y: 9000 }] }]),
  { xMin: 10, xMax: 10, yMin: 100, yMax: 100 },
);

const plot = { left: 40, top: 10, width: 400, height: 200 };

check(
  'a reading at the domain floor sits on the plot origin',
  scatterPlacement({ x: 0, y: 0 }, { xMin: 0, xMax: 100, yMin: 0, yMax: 100 }, plot),
  { cx: 40, cy: 210 },
);
check(
  'a reading at the domain ceiling sits on the far corner',
  scatterPlacement({ x: 100, y: 100 }, { xMin: 0, xMax: 100, yMin: 0, yMax: 100 }, plot),
  { cx: 440, cy: 10 },
);
check(
  'the middle of the domain is the middle of the plot',
  scatterPlacement({ x: 50, y: 50 }, { xMin: 0, xMax: 100, yMin: 0, yMax: 100 }, plot),
  { cx: 240, cy: 110 },
);
// Clamped rather than drawn outside: a pinned domain narrower than the data would otherwise put a
// mark over the axis labels.
check(
  'a reading past the ceiling lands on the edge',
  scatterPlacement({ x: 500, y: 500 }, { xMin: 0, xMax: 100, yMin: 0, yMax: 100 }, plot),
  { cx: 440, cy: 10 },
);
check(
  'a degenerate domain puts everything on the origin',
  scatterPlacement({ x: 5, y: 5 }, { xMin: 5, xMax: 5, yMin: 5, yMax: 5 }, plot),
  { cx: 40, cy: 210 },
);

finish('scatter-chart-math');
