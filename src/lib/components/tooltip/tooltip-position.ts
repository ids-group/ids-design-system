import type { OverlayRef } from '@angular/cdk/overlay';
import type { TooltipPlacement } from './tooltip.types';

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

// positionChanges skips a re-apply that only pushes the pane; the styles CDK writes do not.
// The pane is measured, not the panel: the panel's enter animation scales it.
export function pointArrowAtHost(
  ref: OverlayRef,
  panel: HTMLElement,
  host: HTMLElement,
): void {
  const pane = ref.overlayElement;
  const point = () => {
    const trigger = host.getBoundingClientRect();
    const box = pane.getBoundingClientRect();
    panel.style.setProperty(
      '--_tooltip-arrow-x',
      `${trigger.left + trigger.width / 2 - box.left - panel.clientLeft}px`,
    );
    panel.style.setProperty(
      '--_tooltip-arrow-y',
      `${trigger.top + trigger.height / 2 - box.top - panel.clientTop}px`,
    );
  };
  const observer = new MutationObserver(point);
  observer.observe(ref.hostElement, { attributeFilter: ['style'] });
  observer.observe(pane, { attributeFilter: ['style'] });
  ref.detachments().subscribe({ complete: () => observer.disconnect() });
}
