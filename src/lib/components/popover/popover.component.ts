import {
  Component,
  OnDestroy,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CdkTrapFocus } from '@angular/cdk/a11y';

export type PopoverAlign = 'start' | 'end';

@Component({
  selector: 'ds-popover',
  standalone: true,
  imports: [CdkTrapFocus],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class PopoverComponent implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly renderer = inject(Renderer2);
  protected readonly panelTpl = viewChild.required<TemplateRef<unknown>>('panel');
  private ref: OverlayRef | null = null;
  private dismissUnlisten: (() => void) | null = null;

  readonly align = input<PopoverAlign>('start');

  /** ARIA role for the panel (e.g. 'dialog' for interactive popovers). When set,
   *  the panel also traps focus, auto-captures it into the panel on open, and
   *  restores it to the trigger on close (Escape or backdrop). Leave null for
   *  plain, non-interactive text popovers. */
  readonly panelRole = input<string | null>(null);
  /** Accessible name for the panel; pair with `panelRole`. */
  readonly panelLabel = input<string | null>(null);

  /** Auto-dismiss when an actionable item (`[role="menuitem"]`) inside the panel
   *  is clicked, so a popover used as a menu closes on pick. Keyed off the ARIA
   *  role, not a component selector, so the popover stays decoupled from
   *  ds-menu-item. Disabled items render a disabled <button> that never fires
   *  click. Set false for popovers that aren't menus. */
  readonly dismissOnSelect = input(true, { transform: booleanAttribute });

  /** Open/closed state — for callers binding `aria-expanded` on the trigger. */
  readonly opened = signal(false);

  toggle(trigger: HTMLElement): void {
    if (this.ref) {
      this.close();
      return;
    }
    const align = this.align();
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(trigger)
      .withPositions([
        { originX: align, originY: 'bottom', overlayX: align, overlayY: 'top', offsetY: 4 },
        { originX: align, originY: 'top',    overlayX: align, overlayY: 'bottom', offsetY: -4 },
      ]);
    const cfg: OverlayConfig = {
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    };
    this.ref = this.overlay.create(cfg);
    this.ref.backdropClick().subscribe(() => this.close());
    this.ref.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
        trigger.focus();
      }
    });
    this.ref.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.opened.set(true);

    // The clicked item's own (pressed) handler runs first (target phase) before
    // this bubbled listener. Renderer2.listen returns an unlisten fn dropped in
    // close(), so nothing outlives the open panel.
    if (this.dismissOnSelect()) {
      this.dismissUnlisten = this.renderer.listen(
        this.ref.overlayElement,
        'click',
        (event: Event) => {
          if ((event.target as Element | null)?.closest('[role="menuitem"]')) {
            this.close();
          }
        },
      );
    }
  }

  close(): void {
    this.dismissUnlisten?.();
    this.dismissUnlisten = null;
    this.ref?.dispose();
    this.ref = null;
    this.opened.set(false);
  }

  ngOnDestroy(): void {
    this.close();
  }
}
