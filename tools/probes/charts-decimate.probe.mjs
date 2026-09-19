import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { registerComponentsFacade } from './register-components-facade.mjs';
import { check, finish } from './probe-check.mjs';

const components = registerComponentsFacade(import.meta.url, []);

const { decimationTarget, minMaxDecimate, lttbDecimate, needsDecimating } =
  await import(pathToFileURL(join(components, 'charts-decimate.ts')).href);

const ramp = (count) =>
  Array.from({ length: count }, (unused, index) => ({ x: index, y: index }));

// A spike buried mid-series: the whole point of MinMax is that this survives, because a reader
// looking at a scatter is usually looking for exactly this.
const withSpike = (count, at, height) =>
  ramp(count).map((point) =>
    point.x === at ? { x: point.x, y: height } : point,
  );

// ------------------------------------------------------- when it kicks in
check('the target is the plot width in pixels', decimationTarget(640), 640);
check('a plot with no width asks for nothing', decimationTarget(0), 0);
// Four times, not two: decimating a series only twice the target trades a visible loss of detail
// for a saving nobody measures.
check('under four times the target nothing is decimated', needsDecimating(2000, 640), false);
check('at four times the target nothing is decimated yet', needsDecimating(2560, 640), false);
check('past four times the target it is', needsDecimating(2561, 640), true);
check('no target means no decimating', needsDecimating(10000, 0), false);

// ------------------------------------------------------------- min / max
check(
  'minMax keeps the series when it is already short enough',
  minMaxDecimate(ramp(10), 100).length,
  10,
);
check(
  'minMax never returns more than it was asked for',
  minMaxDecimate(ramp(10000), 640).length <= 640,
  true,
);
check(
  'minMax keeps the global maximum',
  Math.max(...minMaxDecimate(withSpike(10000, 4321, 999999), 640).map((p) => p.y)),
  999999,
);
check(
  'minMax keeps the global minimum',
  Math.min(...minMaxDecimate(withSpike(10000, 4321, -999999), 640).map((p) => p.y)),
  -999999,
);
check(
  'minMax returns the points in x order',
  minMaxDecimate(withSpike(10000, 4321, 999999), 640).every(
    (point, index, all) => index === 0 || all[index - 1].x <= point.x,
  ),
  true,
);
check('minMax of nothing is nothing', minMaxDecimate([], 640), []);

// ------------------------------------------------------------------ lttb
check(
  'lttb keeps the first and the last reading',
  [lttbDecimate(ramp(5000), 500)[0].x, lttbDecimate(ramp(5000), 500).at(-1).x],
  [0, 4999],
);
check(
  'lttb returns what it was asked for',
  lttbDecimate(ramp(5000), 500).length,
  500,
);
check(
  'lttb keeps a short series whole',
  lttbDecimate(ramp(10), 500).length,
  10,
);
// The honest difference, and the reason MinMax is the default. One lone spike survives either way
// - it makes a huge triangle - so the guarantee only shows on a series with more spikes than the
// budget has room for. MinMax keeps every bucket's peak by construction; LTTB keeps whichever ones
// describe the silhouette.
const spiky = ramp(4000).map((point) =>
  point.x % 40 === 7 ? { x: point.x, y: point.y + 5000 } : point,
);
const peaksKept = (result) => result.filter((p) => p.y >= 5000).length;
check(
  'minMax keeps a peak from every bucket it has room for',
  peaksKept(minMaxDecimate(spiky, 120)) >= 55,
  true,
);
check(
  'lttb keeps fewer of them at the same budget',
  peaksKept(lttbDecimate(spiky, 120)) < peaksKept(minMaxDecimate(spiky, 120)),
  true,
);

finish('charts-decimate');
