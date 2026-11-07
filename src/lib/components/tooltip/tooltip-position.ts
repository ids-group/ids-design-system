import type { TooltipPlacement } from '@ids-group-ltd/ids-design-system/core';

const TRIGGER_GAP_PX = 8;
export const VIEWPORT_MARGIN_PX = 8;
const OPPOSITE_PLACEMENT: Record<TooltipPlacement, TooltipPlacement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

function positionFor(placement: TooltipPlacement) {
  switch (placement) {
    case 'top':
      return {
        originX: 'center' as const,
        originY: 'top' as const,
        overlayX: 'center' as const,
        overlayY: 'bottom' as const,
        offsetY: -TRIGGER_GAP_PX,
      };
    case 'bottom':
      return {
        originX: 'center' as const,
        originY: 'bottom' as const,
        overlayX: 'center' as const,
        overlayY: 'top' as const,
        offsetY: TRIGGER_GAP_PX,
      };
    case 'left':
      return {
        originX: 'start' as const,
        originY: 'center' as const,
        overlayX: 'end' as const,
        overlayY: 'center' as const,
        offsetX: -TRIGGER_GAP_PX,
      };
    case 'right':
      return {
        originX: 'end' as const,
        originY: 'center' as const,
        overlayX: 'start' as const,
        overlayY: 'center' as const,
        offsetX: TRIGGER_GAP_PX,
      };
  }
}

export function positionsFor(placement: TooltipPlacement) {
  return [positionFor(placement), positionFor(OPPOSITE_PLACEMENT[placement])];
}
