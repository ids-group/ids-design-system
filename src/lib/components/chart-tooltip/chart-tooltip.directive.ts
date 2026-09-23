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
import {
  closeOnScroll,
  disposeWithLeave,
} from '@ids-group-ltd/ids-design-system/components';
import { ChartTooltipPanelComponent } from './chart-tooltip-panel.component';
import type {
  ChartTooltipContext,
  ChartTooltipOrigin,
} from './chart-tooltip.types';

const POINTER_GAP_PX = 6;
// A fingertip covers roughly 40 CSS px, so a touch-opened panel has to clear the tap
// point by more than a pointer-opened one does.
const TOUCH_GAP_PX = 48;

// Keeps the panel off the screen edge, and matches the `--space-3` the panel reserves in its own
// `max-height`. The two have to agree: CDK pushes against this margin, and a panel allowed to grow
// past what the margin leaves is one push cannot fit.
const VIEWPORT_MARGIN_PX = 12;

// Four fallbacks are what make the panel flip out of a small dashboard card rather than be
// clipped by it. Above first, except while a mark is HELD: the Unpin control sits at the plot's
// top edge, and a panel that opens upward from a mark in the upper half lands on top of it. The
// panel is portaled to the body, so no z-index can lift the control over it — an app layout that
// isolates its own stacking context traps the chart's chrome below the overlay whatever number it
// carries.
function positionsFor(gap: number, preferBelow: boolean): ConnectedPosition[] {
  const above: ConnectedPosition = {
    originX: 'center',
    originY: 'top',
    overlayX: 'center',
    overlayY: 'bottom',
    offsetY: -gap,
  };
  const below: ConnectedPosition = {
    originX: 'center',
    originY: 'bottom',
    overlayX: 'center',
    overlayY: 'top',
    offsetY: gap,
  };

  return [
    ...(preferBelow ? [below, above] : [above, below]),
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

  /** Extra clearance between the mark and the panel, on top of the pointer default. A chart that
   *  prints something ABOVE its mark — a column with its value on top — needs the panel to clear
   *  that text as well as the mark, or the two overlap. Ignored for touch, where the gap is already
   *  sized for a fingertip. */
  readonly dsChartTooltipExtraGap = input(0);
  /** Opens the panel BELOW the mark first. A chart sets it while a mark is held, so the panel
   *  leaves the plot's top edge — and the Unpin control that lives there — alone. */
  readonly dsChartTooltipPreferBelow = input(false);

  /** A held panel takes the pointer again, so its text can be selected. While it merely follows
   *  the pointer the pane stays inert, or the mark it covers never sees the pointer at all. */
  readonly dsChartTooltipPinned = input(false);

  private overlayRef: OverlayRef | null = null;
  private panelRef: ComponentRef<ChartTooltipPanelComponent> | null = null;
  private detachScrollReposition: (() => void) | null = null;
  private detachEscape: (() => void) | null = null;

  constructor() {
    effect(() => {
      const context = this.dsChartTooltip();
      const origin = this.dsChartTooltipOrigin();
      if (!context?.entries.length || !origin) {
        this.close();

        return;
      }
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
        panelClass: ['ds-overlay-pane', 'ds-chart-tooltip-pane'],
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
      });
      this.panelRef = this.overlayRef.attach(
        new ComponentPortal(ChartTooltipPanelComponent, this.viewContainerRef),
      );
      // CDK's reposition strategy watches `window` and registered `cdkScrollable`s only, so it
      // misses an app's own `overflow: auto` container. Moved rather than closed: a PINNED mark
      // stops answering pointer moves, so a close here would be permanent, leaving the pin glyph
      // and the Unpin control standing over a reading that is gone.
      this.detachScrollReposition = closeOnScroll(this.overlayRef, () =>
        this.overlayRef?.updatePosition(),
      );
      this.detachEscape = this.closeOnEscape();
    } else {
      this.overlayRef.updatePositionStrategy(this.strategyFor(origin));
    }
    this.overlayRef.overlayElement.classList.toggle(
      'is-pinned',
      this.dsChartTooltipPinned(),
    );
    this.panelRef?.setInput('context', context);
    this.panelRef?.setInput('template', this.dsChartTooltipTemplate());
  }

  private strategyFor(origin: ChartTooltipOrigin) {
    const gap = coarsePointer()
      ? TOUCH_GAP_PX
      : POINTER_GAP_PX + this.dsChartTooltipExtraGap();

    return this.overlay
      .position()
      .flexibleConnectedTo(origin as FlexibleConnectedPositionStrategyOrigin)
      .withFlexibleDimensions(false)
      .withPush(true)
      .withViewportMargin(VIEWPORT_MARGIN_PX)
      .withPositions(positionsFor(gap, this.dsChartTooltipPreferBelow()));
  }

  // WCAG 1.4.13 wants the panel dismissable WITHOUT moving the pointer or the focus, which rules
  // out "move off the mark". Nothing re-opens it afterwards: the effect re-runs on a CHANGE to the
  // context or the origin, and neither changes while the pointer rests where it already is — so the
  // reader keeps the screen they cleared until they visit another mark.
  private closeOnEscape(): () => void {
    if (typeof document === 'undefined') {
      return () => undefined;
    }
    const onKeydown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', onKeydown, true);

    return () => document.removeEventListener('keydown', onKeydown, true);
  }

  private close(): void {
    this.detachEscape?.();
    this.detachEscape = null;
    this.detachScrollReposition?.();
    this.detachScrollReposition = null;
    // A dismissal, never a selection: the panel closes when the reader leaves the plot, and the
    // family's answer to that is a fade. Moving between marks repositions this overlay rather than
    // closing it, so nothing here can lag behind the pointer.
    disposeWithLeave(this.overlayRef, 'dismiss');
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
