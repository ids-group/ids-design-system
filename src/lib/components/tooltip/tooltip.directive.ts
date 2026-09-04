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
import { prepareOverlayEnter } from '@ids-group-ltd/ids-design-system/components';
import type { TooltipPlacement } from './tooltip.types';

let nextId = 0;

@Directive({
  selector: '[dsTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly host = inject(ElementRef<HTMLElement>);

  /** Tip text. An empty string is how you turn the tooltip off — a host bound to a
   *  value that may be blank needs no separate condition. */
  readonly dsTooltip = input<string>('');
  /** Which side the tip opens on. It does NOT flip: only the requested side is
   *  offered to the overlay, so a tip with no room there is pushed rather than moved
   *  to the opposite side. */
  readonly dsTooltipPlacement = input<TooltipPlacement>('top');
  /** Milliseconds before the tip appears. Hiding is immediate — this delay only ever
   *  suppresses a tip the pointer passed over on its way somewhere else. */
  readonly dsTooltipDelay = input<number>(120);

  private ref: OverlayRef | null = null;
  private timer: number | null = null;
  private readonly tipId = `ds-tooltip-${++nextId}`;

  /**
   * Where `aria-describedby` belongs, when focus is involved. A host that is not
   * focusable itself never reaches a screen reader — `ds-menu-item` carries
   * `role="none"` and puts the real `<button>` inside — so describing the host
   * describes something the user never focuses. `focusin` bubbles, so its target
   * IS whatever took focus; recording it is what keeps this directive out of the
   * host component's internal DOM. A pointer-only open leaves this null and
   * falls back to the host, where no screen reader is involved anyway.
   */
  private focusedTarget: HTMLElement | null = null;

  /**
   * Where `aria-describedby` was actually written, remembered so teardown strips
   * it from the same element. Not derivable at teardown: focus can arrive after
   * the panel opened (hover, then click or arrow onto it), which moves
   * `focusedTarget` and would otherwise strand the attribute on the host,
   * pointing at a panel that no longer exists.
   */
  private describedElement: HTMLElement | null = null;

  @HostListener('mouseenter')
  protected onPointerEnter(): void {
    this.scheduleShow();
  }

  @HostListener('focusin', ['$event'])
  protected onFocusIn(event: FocusEvent): void {
    if (event.target instanceof HTMLElement) {
      this.focusedTarget = event.target;
    }
    this.scheduleShow();
  }

  @HostListener('focusout')
  protected onFocusOut(): void {
    this.focusedTarget = null;
    this.onClose();
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
  @HostListener('click')
  protected onClose(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.disposeRef();
  }

  private disposeRef(): void {
    this.ref?.dispose();
    this.ref = null;
    const described = this.describedElement;
    if (!described) {
      return;
    }
    this.describedElement = null;
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
    const described = this.focusedTarget ?? this.host.nativeElement;
    this.describedElement = described;
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
