import {
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  inject,
  input,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TooltipPanelComponent } from './tooltip-panel.component';
import { prepareOverlayEnter } from '../overlay-motion';
import type { TooltipPlacement } from './tooltip.types';

let nextId = 0;


@Directive({
  selector: '[dsTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly dsTooltip = input<string>('');
  readonly dsTooltipPlacement = input<TooltipPlacement>('top');
  readonly dsTooltipDelay = input<number>(120);

  private ref: OverlayRef | null = null;
  private timer: number | null = null;
  private readonly tipId = `ds-tooltip-${++nextId}`;

  /**
   * The element `aria-describedby` belongs on. Not always the host: a host that
   * is not focusable itself never reaches a screen reader — `ds-menu-item`
   * carries `role="none"` and puts the real `<button>` inside — so describing
   * the host describes something the user never focuses. `focusin` bubbles, so
   * its target IS whatever took focus; recording that is what keeps this
   * directive out of the host component's internal DOM. A pointer-only open
   * leaves it at the host, where no screen reader is involved anyway.
   */
  private described: HTMLElement = this.host.nativeElement;

  @HostListener('mouseenter')
  protected onPointerEnter(): void {
    this.scheduleShow();
  }

  @HostListener('focusin', ['$event'])
  protected onFocusIn(event: FocusEvent): void {
    if (event.target instanceof HTMLElement) {
      this.described = event.target;
    }
    this.scheduleShow();
  }

  private scheduleShow(): void {
    if (!this.dsTooltip()) {
      return;
    }
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.timer = window.setTimeout(() => this.show(), this.dsTooltipDelay());
  }

  // Close on activation too: clicking the thing the tip describes is a clear
  // dismiss, and a re-rendered anchor (e.g. a navigated sidenav item) under a
  // stationary cursor fires no mouseleave, which would otherwise strand the panel.
  @HostListener('mouseleave')
  @HostListener('focusout')
  @HostListener('click')
  protected onClose(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.disposeRef();
    // Back to the host, so a later pointer-only open cannot describe whatever
    // happened to hold focus last time.
    this.described = this.host.nativeElement;
  }

  private disposeRef(): void {
    this.ref?.dispose();
    this.ref = null;
    const described = this.described;
    const remaining = (described.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .filter((id: string) => id && id !== this.tipId)
      .join(' ');
    if (remaining) {
      described.setAttribute('aria-describedby', remaining);
    } else {
      described.removeAttribute('aria-describedby');
    }
  }

  @HostListener('keydown.escape')
  protected onEscape(): void {
    if (this.ref) {
      this.onClose();
    }
  }

  private show(): void {
    // A re-render or re-entrant hover can call show() with a panel still open;
    // dispose it first so the OverlayRef isn't leaked and aria-describedby
    // doesn't accumulate the same id twice.
    this.disposeRef();
    const placement = this.dsTooltipPlacement();
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.host)
      .withPositions([this.positionFor(placement)]);

    this.ref = this.overlay.create({
      positionStrategy,
      panelClass: 'ds-overlay-pane',
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });
    prepareOverlayEnter(this.ref, this.host.nativeElement, positionStrategy);

    const cmpRef = this.ref.attach(new ComponentPortal(TooltipPanelComponent));
    cmpRef.setInput('text', this.dsTooltip());
    cmpRef.setInput('placement', placement);
    cmpRef.setInput('panelId', this.tipId);
    const described = this.described;
    const existing = described.getAttribute('aria-describedby');
    described.setAttribute(
      'aria-describedby',
      existing ? `${existing} ${this.tipId}` : this.tipId,
    );
  }

  private positionFor(placement: TooltipPlacement) {
    switch (placement) {
      case 'top':
        return {
          originX: 'center' as const,
          originY: 'top' as const,
          overlayX: 'center' as const,
          overlayY: 'bottom' as const,
          offsetY: -8,
        };
      case 'bottom':
        return {
          originX: 'center' as const,
          originY: 'bottom' as const,
          overlayX: 'center' as const,
          overlayY: 'top' as const,
          offsetY: 8,
        };
      case 'left':
        return {
          originX: 'start' as const,
          originY: 'center' as const,
          overlayX: 'end' as const,
          overlayY: 'center' as const,
          offsetX: -8,
        };
      case 'right':
        return {
          originX: 'end' as const,
          originY: 'center' as const,
          overlayX: 'start' as const,
          overlayY: 'center' as const,
          offsetX: 8,
        };
    }
  }

  ngOnDestroy(): void {
    this.onClose();
  }
}
