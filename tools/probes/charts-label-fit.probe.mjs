import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { registerComponentsFacade } from './register-components-facade.mjs';
import { check, finish } from './probe-check.mjs';

const components = registerComponentsFacade(import.meta.url, []);

const { labelInterval, rotationWouldFit } = await import(
  pathToFileURL(join(components, 'charts-label-fit.ts')).href
);

check('every label fits when there is room', labelInterval([40, 40, 40, 40], 100, false), 1);
check('every second label when they collide', labelInterval([90, 90, 90, 90], 100, false), 2);
check('every third when they badly collide', labelInterval([190, 190, 190, 190], 100, false), 3);
// Rotation is tried BEFORE thinning: a label turned 45 degrees takes sin(45) of its width across,
// which buys back the room a thinned axis would have paid for by dropping readings.
check('rotation buys back the room', labelInterval([90, 90, 90, 90], 100, true), 1);
check('no labels is interval one', labelInterval([], 100, false), 1);

// The widest decides for all of them: one long month name among short ones thins the axis exactly
// as hard as if every label were that long. An axis that thinned on the AVERAGE would return 1
// here and collide on the one label that matters.
check(
  'the widest label decides, not the average',
  labelInterval([10, 10, 190, 10], 100, false),
  labelInterval([190, 190, 190, 190], 100, false),
);
check('a plot with no step asks for nothing', labelInterval([40, 40], 0, false), 1);
check('a negative step is the same as none', labelInterval([40, 40], -50, false), 1);
check(
  'a non-finite width does not poison the interval',
  labelInterval([Number.NaN, 40], 100, false),
  1,
);

// Rotation is spent before thinning, so the axis asks this first and only thins when a tilt is
// not enough.
check('rotation is worth trying when it saves every label', rotationWouldFit([90, 90], 100), true);
check('nothing to buy back when they already fit', rotationWouldFit([40, 40], 100), false);
check('rotation does not save a badly colliding axis', rotationWouldFit([190, 190], 100), false);

finish('charts-label-fit');
