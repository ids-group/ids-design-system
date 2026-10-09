import { registerHooks } from 'node:module';
import { check, finish } from './probe-check.mjs';

// `charts-skeleton.ts` imports nothing; registerHooks keeps the import shape of the other chart probes.
registerHooks({});

const {
  CHART_SKELETON_COUNT,
  skeletonColumnHeights,
  skeletonFunnelClips,
  skeletonLineClip,
  skeletonMarkCount,
  skeletonWaterfallSteps,
} = await import(
  new URL('../../src/lib/components/charts-skeleton.ts', import.meta.url).href
);

check('the default count is five', CHART_SKELETON_COUNT, 5);
check('known data sets the count', skeletonMarkCount(8, 3), 8);
check('no data takes the input', skeletonMarkCount(0, 3), 3);
check('a fractional input rounds down', skeletonMarkCount(0, 6.7), 6);
check('zero falls back to the default', skeletonMarkCount(0, 0), 5);
check('NaN falls back to the default', skeletonMarkCount(0, Number.NaN), 5);

check('one height per column', skeletonColumnHeights(3), [0.45, 0.62, 0.52]);
check(
  'heights repeat past the pattern',
  skeletonColumnHeights(9).slice(7),
  [0.45, 0.62],
);

// A waterfall opens and closes on totals standing on the axis; the deltas float between them.
check('five steps', skeletonWaterfallSteps(5), [
  { bottom: 0, height: 0.9 },
  { bottom: 0.74, height: 0.16 },
  { bottom: 0.6, height: 0.14 },
  { bottom: 0.6, height: 0.08 },
  { bottom: 0, height: 0.68 },
]);
check('two steps are two totals', skeletonWaterfallSteps(2), [
  { bottom: 0, height: 0.9 },
  { bottom: 0, height: 0.9 },
]);
check('one step is one total', skeletonWaterfallSteps(1), [
  { bottom: 0, height: 0.85 },
]);
check(
  'every step stays inside the plot',
  skeletonWaterfallSteps(40).every(
    ({ bottom, height }) =>
      bottom >= 0 && height > 0 && bottom + height <= 0.9 + 1e-9,
  ),
  true,
);

const clips = skeletonFunnelClips(3);
check('one clip per stage', clips.length, 3);
check(
  'the first stage starts at full width',
  clips[0],
  'polygon(0% 0, 100% 0, 90% 100%, 10% 100%)',
);
check(
  'each stage starts where the one above ends',
  clips[1],
  'polygon(10% 0, 90% 0, 80% 100%, 20% 100%)',
);
check(
  'the last stage ends at 40% of the width',
  clips[2].endsWith('70% 100%, 30% 100%)'),
  true,
);

check(
  'a line passes through every category centre and back',
  skeletonLineClip(2),
  'polygon(25% calc(58% - 2px), 75% calc(48% - 2px), 75% calc(48% + 2px), 25% calc(58% + 2px))',
);
check(
  'a single category still draws a segment',
  skeletonLineClip(1),
  skeletonLineClip(2),
);

finish('charts-skeleton');
