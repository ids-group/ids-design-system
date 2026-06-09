import {
  Component,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { DismissibleOverlay } from '../../overlay/dismissible-overlay';

export type PopoverAlign = 'start' | 'end';

@Component({
  selector: 'ds-popover',
  standalone: true,
  imports: [CdkTrapFocus],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  // Expose this popover as a DismissibleOverlay so projected content (e.g.
  // ds-menu-item) can close it via DI — the popover never references a child.
  providers: [{ provide: DismissibleOverlay, useExisting: forwardRef(() => PopoverComponent) }],
})
export class PopoverComponent implements OnDestroy, DismissibleOverlay {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  protected readonly panelTpl = viewChild.required<TemplateRef<unknown>>('panel');
  private ref: OverlayRef | null = null;

  readonly align = input<PopoverAlign>('start');

  /** ARIA role for the panel (e.g. 'dialog' for interactive popovers). When set,
   *  the panel also traps focus, auto-captures it into the panel on open, and
   *  restores it to the trigger on close (Escape or backdrop). Leave null for
   *  plain, non-interactive text popovers. */
  readonly panelRole = input<string | null>(null);
  /** Accessible name for the panel; pair with `panelRole`. */
  readonly panelLabel = input<string | null>(null);

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
  }

  close(): void {
    this.ref?.dispose();
    this.ref = null;
    this.opened.set(false);
  }

  ngOnDestroy(): void {
    this.close();
  }
}
