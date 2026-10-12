import {
  ComponentRef,
  DestroyRef,
  Directive,
  ElementRef,
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
  forwardOverlayTokens,
  listenForEscape,
  chartTiming,
} from '@ids-group-ltd/ids-design-system/components';
import { ChartTooltipPanelComponent } from './chart-tooltip-panel.component';
import type {
  ChartTooltipContext,
  ChartTooltipOrigin,
} from './chart-tooltip.types';

const POINTER_GAP_PX = 10;
// Portaled to the body, so a chart's own values reach the panel only by being copied.
const CHART_TOOLTIP_TOKENS = [
  '--ds-chart-tooltip-bg-color',
  '--ds-chart-tooltip-text-color',
  '--ds-chart-tooltip-border-color',
] as const;
// A fingertip covers roughly 40 CSS px, so a touch-opened panel clears the tap point further.
const TOUCH_GAP_PX = 48;

// Must equal the `--space-3` in the panel's `max-height`.
const VIEWPORT_MARGIN_PX = 12;

// Four fallbacks let the panel flip out of a small card instead of being clipped. Above first.
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

/** The chart tooltip: a non-null context opens the panel, null closes it. @internal */
@Directive({
  selector: '[dsChartTooltip]',
  standalone: true,
})
export class ChartTooltipDirective {
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly dsChartTooltip = input<ChartTooltipContext | null>(null);
  readonly dsChartTooltipOrigin = input<ChartTooltipOrigin | null>(null);
  readonly dsChartTooltipTemplate = input<TemplateRef<{
    $implicit: ChartTooltipContext;
  }> | null>(null);

  /** Extra clearance between the mark and the panel, for text printed above the mark. Ignored for touch. */
  readonly dsChartTooltipExtraGap = input(0);

  /** A held panel takes the pointer so its text can be selected; a following one stays inert or
   *  the mark under it never sees the pointer. */
  readonly dsChartTooltipPinned = input(false);

  /** Whether each reading carries its colour dot. `'auto'` draws them for two to four readings. */
  readonly dsChartTooltipSwatches = input<boolean | 'auto'>('auto');

  private overlayRef: OverlayRef | null = null;
  private panelRef: ComponentRef<ChartTooltipPanelComponent> | null = null;
  private detachScrollReposition: (() => void) | null = null;
  private detachEscape: (() => void) | null = null;
  private detachOffscreen: (() => void) | null = null;
  private glide: Animation | null = null;

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
    // Measured before the in-flight glide is dropped, so a mid-glide re-aim starts from the visible position.
    const from =
      this.overlayRef?.overlayElement.getBoundingClientRect() ?? null;
    this.glide?.cancel();
    this.glide = null;
    // Reposition, not re-create: a fresh OverlayRef restarts the enter transition.
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create({
        positionStrategy: this.strategyFor(origin),
        panelClass: ['ds-overlay-pane', 'ds-chart-tooltip-pane'],
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
      });
      this.panelRef = this.overlayRef.attach(
        new ComponentPortal(ChartTooltipPanelComponent, this.viewContainerRef),
      );
      forwardOverlayTokens(
        this.overlayRef,
        this.host.nativeElement,
        CHART_TOOLTIP_TOKENS,
      );
      // CDK's reposition strategy misses an app's own `overflow: auto` container. A following panel
      // closes; a pinned one moves, or a close would strand the pin glyph and Unpin.
      this.detachScrollReposition = closeOnScroll(this.overlayRef, () =>
        this.dsChartTooltipPinned()
          ? this.overlayRef?.updatePosition()
          : this.close(),
      );
      // WCAG 1.4.13: dismissable without moving pointer or focus. Stays closed until the context or origin changes.
      this.detachEscape = listenForEscape(
        typeof document === 'undefined' ? null : document,
        () => this.close(),
      );
      this.detachOffscreen = hideWhileOffscreen(
        this.overlayRef.overlayElement,
        this.host.nativeElement,
      );
    } else {
      this.overlayRef.updatePositionStrategy(this.strategyFor(origin));
    }
    this.overlayRef.overlayElement.classList.toggle(
      'is-pinned',
      this.dsChartTooltipPinned(),
    );
    this.panelRef?.setInput('context', context);
    this.panelRef?.setInput('template', this.dsChartTooltipTemplate());
    this.panelRef?.setInput('swatches', this.dsChartTooltipSwatches());
    if (from) {
      // Render the new reading first, or a resized panel lands where the old one would.
      this.panelRef?.changeDetectorRef.detectChanges();
      this.overlayRef.updatePosition();
      this.glideFrom(from, this.overlayRef.overlayElement);
    }
  }

  // `translate`, not `transform`: the pane's enter and leave animate `transform`.
  private glideFrom(from: DOMRect, pane: HTMLElement): void {
    const to = pane.getBoundingClientRect();
    const deltaX = from.left - to.left;
    const deltaY = from.top - to.top;
    if ((deltaX === 0 && deltaY === 0) || typeof pane.animate !== 'function') {
      return;
    }
    const timing = chartTiming(pane, 'tooltip-move');
    if (!timing) {
      return;
    }
    this.glide = pane.animate(
      [{ translate: `${deltaX}px ${deltaY}px` }, { translate: '0 0' }],
      timing,
    );
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
      .withPositions(positionsFor(gap));
  }

  private close(): void {
    this.detachEscape?.();
    this.detachEscape = null;
    this.detachScrollReposition?.();
    this.detachScrollReposition = null;
    this.detachOffscreen?.();
    this.detachOffscreen = null;
    disposeWithLeave(this.overlayRef, 'dismiss');
    this.glide = null;
    this.overlayRef = null;
    this.panelRef = null;
  }
}

// A pinned panel survives a scroll, and the position strategy's push would hold it inside the
// viewport after its chart has gone; it hides while the chart is out of sight instead.
function hideWhileOffscreen(pane: HTMLElement, chart: HTMLElement): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    return () => undefined;
  }
  const observer = new IntersectionObserver(([entry]) => {
    pane.style.visibility = entry?.isIntersecting ? '' : 'hidden';
  });
  observer.observe(chart);

  return () => observer.disconnect();
}

function coarsePointer(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches
  );
}
