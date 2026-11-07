import { overlayPlacementOf } from '../../src/lib/components/overlay-motion.ts';
import { check, finish } from './probe-check.mjs';

const pair = (originX, originY, overlayX, overlayY) => ({
  originX,
  originY,
  overlayX,
  overlayY,
});

check(
  'below the trigger',
  overlayPlacementOf(pair('start', 'bottom', 'start', 'top')),
  'bottom',
);
check(
  'above the trigger',
  overlayPlacementOf(pair('end', 'top', 'end', 'bottom')),
  'top',
);
check(
  'right, centred',
  overlayPlacementOf(pair('end', 'center', 'start', 'center')),
  'right',
);
check(
  'left, centred',
  overlayPlacementOf(pair('start', 'center', 'end', 'center')),
  'left',
);
// A side pair whose top edges meet keeps overlayY at 'top', so overlayY alone cannot decide.
check(
  'right, top edges aligned',
  overlayPlacementOf(pair('end', 'top', 'start', 'top')),
  'right',
);
check(
  'left, top edges aligned',
  overlayPlacementOf(pair('start', 'top', 'end', 'top')),
  'left',
);
check(
  'left, bottom edges aligned',
  overlayPlacementOf(pair('start', 'bottom', 'end', 'bottom')),
  'left',
);
check(
  'a corner pair reads as vertical',
  overlayPlacementOf(pair('start', 'bottom', 'end', 'top')),
  'bottom',
);
check(
  'a pair covering the trigger enters from above',
  overlayPlacementOf(pair('start', 'top', 'start', 'top')),
  'bottom',
);

finish('overlay-placement');
