import {
  Component,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

export type PopoverAlign = 'start' | 'end';

@Component({
  selector: 'ds-popover',
  standalone: true,
  imports: [],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class PopoverComponent {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  protected readonly panelTpl = viewChild.required<TemplateRef<unknown>>('panel');
  private ref: OverlayRef | null = null;

  readonly align = input<PopoverAlign>('start');

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
    this.ref.attach(new TemplatePortal(this.panelTpl(), this.vcr));

    // Dismiss when an actionable menu item inside the panel is clicked, so a
    // menu behaves like a menu (pick → close). Disabled items render a disabled
    // <button> that never fires click, so they won't dismiss it. The item's own
    // (pressed) handler runs first (target phase) before this bubbled listener.
    this.ref.overlayElement.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('ds-menu-item')) {
        this.close();
      }
    });
  }

  close(): void {
    this.ref?.dispose();
    this.ref = null;
  }
}
