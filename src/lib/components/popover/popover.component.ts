import {
  Component,
  ElementRef,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayRef,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  closeOnOutsidePointer,
  closeOnScroll,
  disposeWithLeave,
  focusIsInside,
  forwardOverlayTokens,
  overlayPlacementOf,
  prepareOverlayEnter,
} from '../overlay-motion';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import { DsOverlayCloseRef } from '../../overlay/ds-overlay-close-ref';
import { DsStaticPreview } from '../static-preview.directive';

export type PopoverAlign = 'start' | 'end';
export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

@Component({
  selector: 'ds-popover',
  standalone: true,
  imports: [CdkTrapFocus, NgTemplateOutlet],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  hostDirectives: [{ directive: DsStaticPreview, inputs: ['staticPreview'] }],
  // Expose this popover as a DsOverlayCloseRef so projected content (e.g.
  // ds-menu-item) can close it via DI — the popover never references a child.
  providers: [
    {
      provide: DsOverlayCloseRef,
      useExisting: forwardRef(() => PopoverComponent),
    },
  ],
})
export class PopoverComponent implements OnDestroy, DsOverlayCloseRef {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly preview = inject(DsStaticPreview);
  protected readonly panelTpl = viewChild<TemplateRef<unknown>>('panel');
  private readonly panelTrap = viewChild(CdkTrapFocus);
  private ref: OverlayRef | null = null;
  private triggerElement: HTMLElement | null = null;
  private focusTimer: ReturnType<typeof setTimeout> | null = null;
  /** Public panel tokens forwarded onto the portaled overlay pane on open so
   *  a consumer's `ds-popover { --ds-popover-panel-*: … }` reaches it. */
  private readonly panelTokens = [
    '--ds-popover-bg-color',
    '--ds-popover-border-color',
    '--ds-popover-radius',
    '--ds-popover-shadow',
    '--ds-popover-padding',
    '--ds-popover-max-width',
    '--ds-popover-min-width',
    '--ds-popover-arrow-size',
    // Forwarded too: a projected ds-menu is portaled into the pane, so a
    // consumer scoping the menu's width in their own DOM can't reach it.
    '--ds-menu-min-width',
    '--ds-menu-max-width',
  ];

  /** Cross-axis alignment of the panel against the trigger. */
  readonly align = input<PopoverAlign>('start');
  /** Which side of the trigger the panel prefers to appear on. */
  readonly placement = input<PopoverPlacement>('bottom');
  /** Render a small caret pointing at the trigger. */
  readonly arrow = input(false, { transform: booleanAttribute });

  /** ARIA role for the panel (e.g. 'dialog' for interactive popovers). When set,
   *  the panel traps focus and captures it on open; a keyboard (Escape) or
   *  in-panel close returns focus to the trigger, while an outside click or
   *  scroll leaves focus where it lands (non-modal). Leave null for plain,
   *  non-interactive text popovers. */
  readonly panelRole = input<string | null>(null);
  /** Accessible name for the panel; pair with `panelRole`. */
  readonly panelLabel = input<string | null>(null);

  /** Open/closed state — for callers binding `aria-expanded` on the trigger. */
  readonly opened = signal(false);
  /** Resolved placement after the overlay positions — drives the arrow direction. */
  readonly resolvedPlacement = signal<PopoverPlacement>('bottom');

  toggle(trigger: HTMLElement): void {
    if (this.preview.staticPreview()) {
      return;
    }
    if (this.ref) {
      this.close();

      return;
    }

    this.triggerElement = trigger;
    const placement = this.placement();
    const arrowOffset = this.arrow() ? 8 : 4;

    const positionStrategy: FlexibleConnectedPositionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(trigger)
      .withPositions(buildPositions(placement, this.align(), arrowOffset))
      .withViewportMargin(8);

    positionStrategy.positionChanges.subscribe((change) => {
      this.resolvedPlacement.set(
        overlayPlacementOf(
          change.connectionPair.overlayY,
          change.connectionPair.overlayX,
        ),
      );
    });

    const cfg: OverlayConfig = {
      positionStrategy,
      hasBackdrop: false,
      panelClass: 'ds-overlay-pane',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    };
    this.ref = this.overlay.create(cfg);
    prepareOverlayEnter(this.ref, this.host.nativeElement, positionStrategy);
    forwardOverlayTokens(this.ref, this.host.nativeElement, this.panelTokens);
    closeOnOutsidePointer(
      this.ref,
      (target) => trigger.contains(target),
      () => this.close(),
    );
    // No backdrop catches a page scroll and CDK's scroll strategies miss a plain
    // overflow container, so close on any outside scroll ourselves.
    const removeScrollClose = closeOnScroll(this.ref, () => this.close());
    this.ref.detachments().subscribe(() => {
      removeScrollClose();
      this.ref = null;
      this.opened.set(false);
    });
    this.ref.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
    });
    this.ref.attach(new TemplatePortal(this.panelTpl()!, this.vcr));
    this.resolvedPlacement.set(placement);
    this.opened.set(true);
    if (this.panelRole()) {
      // Same initial focus as cdkTrapFocusAutoCapture, minus its destroy-time
      // restore — that restore steals focus on an outside/scroll close.
      this.focusTimer = setTimeout(() => {
        this.focusTimer = null;
        void this.panelTrap()?.focusTrap?.focusInitialElementWhenReady();
      });
    }
  }

  close(): void {
    if (!this.ref) {
      return;
    }
    clearTimeout(this.focusTimer ?? undefined);
    this.focusTimer = null;
    const focusWasInPanel = focusIsInside(this.ref);
    disposeWithLeave(this.ref);
    this.ref = null;
    this.opened.set(false);
    if (focusWasInPanel) {
      this.triggerElement?.focus({ preventScroll: true });
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.focusTimer ?? undefined);
    this.ref?.dispose();
    this.ref = null;
  }
}

function buildPositions(
  placement: PopoverPlacement,
  align: PopoverAlign,
  offsetPx: number,
): ConnectedPosition[] {
  const crossStart = align === 'start' ? 'start' : 'end';
  const crossEnd: 'start' | 'end' = align === 'start' ? 'end' : 'start';

  switch (placement) {
    case 'top':
      return [
        {
          originX: crossStart,
          originY: 'top',
          overlayX: crossStart,
          overlayY: 'bottom',
          offsetY: -offsetPx,
        },
        {
          originX: crossStart,
          originY: 'bottom',
          overlayX: crossStart,
          overlayY: 'top',
          offsetY: offsetPx,
        },
        {
          originX: crossEnd,
          originY: 'top',
          overlayX: crossEnd,
          overlayY: 'bottom',
          offsetY: -offsetPx,
        },
      ];
    case 'left':
      return [
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'top',
          offsetX: -offsetPx,
        },
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
          offsetX: offsetPx,
        },
      ];
    case 'right':
      return [
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
          offsetX: offsetPx,
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'top',
          offsetX: -offsetPx,
        },
      ];
    default: // bottom
      return [
        {
          originX: crossStart,
          originY: 'bottom',
          overlayX: crossStart,
          overlayY: 'top',
          offsetY: offsetPx,
        },
        {
          originX: crossStart,
          originY: 'top',
          overlayX: crossStart,
          overlayY: 'bottom',
          offsetY: -offsetPx,
        },
        {
          originX: crossEnd,
          originY: 'bottom',
          overlayX: crossEnd,
          overlayY: 'top',
          offsetY: offsetPx,
        },
      ];
  }
}
