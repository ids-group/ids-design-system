import {
  ComponentRef,
  DestroyRef,
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
} from '@angular/core';
import {
  ConnectedPosition,
  Overlay,
  OverlayRef,
  type FlexibleConnectedPositionStrategyOrigin,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { closeOnScroll } from '@ids-group-ltd/ids-design-system/components';
import { ChartTooltipPanelComponent } from './chart-tooltip-panel.component';
import type {
  ChartTooltipContext,
  ChartTooltipOrigin,
} from './chart-tooltip.types';

const POINTER_GAP_PX = 12;
// A fingertip covers roughly 40 CSS px, so a touch-opened panel has to clear the tap
// point by more than a pointer-opened one does.
const TOUCH_GAP_PX = 48;

// Above first, then below, then either side: four fallbacks are what make the panel flip
// out of a small dashboard card rather than be clipped by it.
function positionsFor(gap: number): ConnectedPosition[] {
  return [
    {
      originX: 'center',
      originY: 'top',
      overlayX: 'center',
      overlayY: 'bottom',
      offsetY: -gap,
    },
    {
      originX: 'center',
      originY: 'bottom',
      overlayX: 'center',
      overlayY: 'top',
      offsetY: gap,
    },
    {
      originX: 'end',
      originY: 'center',
      overlayX: 'start',
      overlayY: 'center',
      offsetX: gap,
    },
    {
      originX: 'start',
      originY: 'center',
      overlayX: 'end',
      overlayY: 'center',
      offsetX: -gap,
    },
  ];
}

/**
 * The chart tooltip, driven entirely by the context a chart hands it: non-null opens the
 * panel, null closes it. Pointer and keyboard therefore share one path — a chart that
 * sets the context on `focus` gets the panel with no pointer involved.
 *
 * @internal
 */
@Directive({
  selector: '[dsChartTooltip]',
  standalone: true,
})
export class ChartTooltipDirective {
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  readonly dsChartTooltip = input<ChartTooltipContext | null>(null);
  readonly dsChartTooltipOrigin = input<ChartTooltipOrigin | null>(null);
  readonly dsChartTooltipTemplate = input<TemplateRef<{
    $implicit: ChartTooltipContext;
  }> | null>(null);

  private overlayRef: OverlayRef | null = null;
  private panelRef: ComponentRef<ChartTooltipPanelComponent> | null = null;
  private detachScrollClose: (() => void) | null = null;

  /** The context a scroll dismissed. A scroll moves the mark out from under the pointer, so the
   *  panel has to go — but the chart's context signal has not changed, and without this the effect
   *  would re-open it on the very next change detection. Cleared by the next DIFFERENT context,
   *  which is what a pointer moving again produces. */
  private dismissed: ChartTooltipContext | null = null;

  constructor() {
    effect(() => {
      const context = this.dsChartTooltip();
      const origin = this.dsChartTooltipOrigin();
      if (!context?.entries.length || !origin) {
        this.dismissed = null;
        this.close();

        return;
      }
      if (context === this.dismissed) {
        return;
      }
      this.dismissed = null;
      this.open(context, origin);
    });
    inject(DestroyRef).onDestroy(() => this.close());
  }

  private open(context: ChartTooltipContext, origin: ChartTooltipOrigin): void {
    // Reposition rather than re-create while the pointer moves between marks: a fresh
    // OverlayRef per mark restarts the enter transition on every band it crosses.
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create({
        positionStrategy: this.strategyFor(origin),
        panelClass: 'ds-overlay-pane',
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
      });
      this.panelRef = this.overlayRef.attach(
        new ComponentPortal(ChartTooltipPanelComponent, this.viewContainerRef),
      );
      // CDK's reposition strategy watches `window` and registered `cdkScrollable`s only, so it
      // misses an app's own `overflow: auto` container — and a panel that stays put while the
      // chart scrolls away points at nothing.
      this.detachScrollClose = closeOnScroll(this.overlayRef, () => {
        this.dismissed = this.dsChartTooltip();
        this.close();
      });
    } else {
      this.overlayRef.updatePositionStrategy(this.strategyFor(origin));
    }
    this.panelRef?.setInput('context', context);
    this.panelRef?.setInput('template', this.dsChartTooltipTemplate());
  }

  private strategyFor(origin: ChartTooltipOrigin) {
    const gap = coarsePointer() ? TOUCH_GAP_PX : POINTER_GAP_PX;

    return this.overlay
      .position()
      .flexibleConnectedTo(origin as FlexibleConnectedPositionStrategyOrigin)
      .withFlexibleDimensions(false)
      .withPush(true)
      .withPositions(positionsFor(gap));
  }

  private close(): void {
    this.detachScrollClose?.();
    this.detachScrollClose = null;
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.panelRef = null;
  }
}

function coarsePointer(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches
  );
}
