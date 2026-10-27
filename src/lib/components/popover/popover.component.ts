import {
  Component,
  ElementRef,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
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
  clearOnDetach,
  closeOnOutsidePointer,
  closeOnScroll,
  disposeWithLeave,
  type DsOverlayCloseCause,
  focusIsInside,
  forwardOverlayTokens,
  overlayPlacementOf,
  prepareOverlayEnter,
} from '@ids-group-ltd/ids-design-system/components';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import { DsOverlayCloseRef } from '@ids-group-ltd/ids-design-system/overlay';
import { DsStaticPreview } from '@ids-group-ltd/ids-design-system/components';
import { MenuComponent } from '@ids-group-ltd/ids-design-system/components/menu';

let nextPanelId = 0;

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
  /** Public panel tokens forwarded onto the portaled overlay pane on open, so a
   *  consumer's `ds-popover { --ds-popover-panel-*: ... }` reaches it. */
  private readonly panelTokens = [
    '--ds-popover-bg-color',
    '--ds-popover-border-color',
    '--ds-popover-radius',
    '--ds-popover-shadow',
    '--ds-popover-padding',
    '--ds-popover-max-width',
    '--ds-popover-min-width',
    '--ds-popover-arrow-size',
    // A projected ds-menu is portaled into the pane, out of reach of a scoped width.
    '--ds-menu-min-width',
    '--ds-menu-max-width',
  ];

  /** Cross-axis alignment of the panel against the trigger. */
  readonly align = input<PopoverAlign>('start');
  /** Which side of the trigger the panel prefers to appear on. */
  readonly placement = input<PopoverPlacement>('bottom');
  /** Render a small caret pointing at the trigger. */
  readonly arrow = input(false, { transform: booleanAttribute });

  /** ARIA role for the panel (e.g. 'dialog'). When set, the panel traps focus and captures it
   *  on open; Escape or an in-panel close returns focus to the trigger, an outside click or
   *  scroll does not (non-modal). Leave null for plain text popovers. A panel holding a
   *  `role="menu"` (a `ds-menu`) captures focus on open without it, untrapped. */
  readonly panelRole = input<string | null>(null);
  /** Accessible name for the panel; pair with `panelRole`. */
  readonly panelLabel = input<string | null>(null);

  /** Open/closed state, for callers binding `aria-expanded` on the trigger. */
  readonly opened = signal(false);
  /** Id of the open panel, for `aria-controls` on the trigger. */
  readonly panelId = `ds-popover-${++nextPanelId}`;
  private readonly menu = contentChild(MenuComponent, { descendants: true });
  /** Whether the projected content holds a `ds-menu`, which makes the trigger `aria-haspopup="menu"`. */
  readonly holdsMenu = computed(() => this.menu() !== undefined);
  /** Resolved placement after the overlay positions; drives the arrow direction. */
  readonly resolvedPlacement = signal<PopoverPlacement>('bottom');

  toggle(trigger: HTMLElement): void {
    if (this.preview.staticPreview()) {
      return;
    }
    // Clicking another trigger while open dismisses the overlay through the CDK's outside-pointer
    // listener FIRST, so `ref` is already gone here and this re-opens on the new trigger.
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
      () => this.close('dismiss'),
    );
    // CDK's scroll strategies miss a plain overflow container, so close on any outside scroll ourselves.
    const removeScrollClose = closeOnScroll(this.ref, () =>
      this.close('dismiss'),
    );
    clearOnDetach(this.ref, {
      current: () => this.ref,
      always: removeScrollClose,
      clear: () => {
        this.ref = null;
        this.opened.set(false);
      },
    });
    this.ref.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close('dismiss');
      }
    });
    this.ref.attach(new TemplatePortal(this.panelTpl()!, this.vcr));
    this.resolvedPlacement.set(placement);
    this.opened.set(true);
    // A menu is operated from inside (APG menu button), so it takes focus without a panelRole.
    if (
      this.panelRole() ||
      this.ref.overlayElement.querySelector('[role="menu"]')
    ) {
      // cdkTrapFocusAutoCapture without its destroy-time restore, which steals focus on an outside/scroll close.
      this.focusTimer = setTimeout(() => {
        this.focusTimer = null;
        void this.panelTrap()?.focusTrap?.focusInitialElementWhenReady();
      });
    }
  }

  close(cause: DsOverlayCloseCause = 'select'): void {
    if (!this.ref) {
      return;
    }
    clearTimeout(this.focusTimer ?? undefined);
    this.focusTimer = null;
    const focusWasInPanel = focusIsInside(this.ref);
    disposeWithLeave(this.ref, cause);
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
