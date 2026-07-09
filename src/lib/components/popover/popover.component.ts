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
import { disposeWithLeave, forwardOverlayTokens } from '../overlay-motion';
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
  private ref: OverlayRef | null = null;
  /** Public panel tokens forwarded onto the portaled overlay pane on open so
   *  a consumer's `ds-popover { --ds-popover-panel-*: … }` reaches it. */
  private readonly panelTokens = [
    '--ds-popover-bg-color',
    '--ds-popover-border-color',
    '--ds-popover-radius',
    '--ds-popover-shadow',
    '--ds-popover-padding',
    '--ds-popover-max-width',
    '--ds-popover-arrow-size',
  ];

  readonly align = input<PopoverAlign>('start');
  /** Which side of the trigger the panel prefers to appear on. */
  readonly placement = input<PopoverPlacement>('bottom');
  /** Render a small caret pointing at the trigger. */
  readonly arrow = input(false, { transform: booleanAttribute });

  /** ARIA role for the panel (e.g. 'dialog' for interactive popovers). When set,
   *  the panel also traps focus, auto-captures it into the panel on open, and
   *  restores it to the trigger on close (Escape or backdrop). Leave null for
   *  plain, non-interactive text popovers. */
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

    const placement = this.placement();
    const arrowOffset = this.arrow() ? 8 : 4;

    const positionStrategy: FlexibleConnectedPositionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(trigger)
      .withPositions(buildPositions(placement, this.align(), arrowOffset));

    positionStrategy.positionChanges.subscribe((change) => {
      this.resolvedPlacement.set(
        connectionToPlacement(
          change.connectionPair.overlayY,
          change.connectionPair.overlayX,
        ),
      );
    });

    const cfg: OverlayConfig = {
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'ds-overlay-pane',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    };
    this.ref = this.overlay.create(cfg);
    forwardOverlayTokens(this.ref, this.host.nativeElement, this.panelTokens);
    this.ref.backdropClick().subscribe(() => this.close());
    this.ref.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
        trigger.focus();
      }
    });
    this.ref.attach(new TemplatePortal(this.panelTpl()!, this.vcr));
    this.resolvedPlacement.set(placement);
    this.opened.set(true);
  }

  close(): void {
    disposeWithLeave(this.ref);
    this.ref = null;
    this.opened.set(false);
  }

  ngOnDestroy(): void {
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

function connectionToPlacement(
  overlayY: string,
  overlayX: string,
): PopoverPlacement {
  if (overlayY === 'top') {
    return 'bottom';
  }
  if (overlayY === 'bottom') {
    return 'top';
  }
  if (overlayX === 'start') {
    return 'right';
  }

  return 'left';
}
