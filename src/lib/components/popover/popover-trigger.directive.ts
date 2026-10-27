import {
  Directive,
  ElementRef,
  afterRenderEffect,
  inject,
  input,
} from '@angular/core';
import { PopoverComponent } from './popover.component';

/**
 * Opens a `ds-popover` from the element it sits on and keeps the trigger's ARIA in step:
 * `aria-haspopup` (`menu` when the popover holds a `ds-menu`, `dialog` otherwise), `aria-expanded`
 * and, while open, `aria-controls`. On `ds-button` and `ds-icon-button` these land on the inner
 * `<button>`, the element a screen reader focuses; the overlay anchors to it too.
 *
 * Writes the attributes itself, so leave `ariaHasPopup`, `ariaExpanded` and `ariaControls` unbound
 * on the same button: a bound value would overwrite them on its next change.
 */
@Directive({
  selector: '[dsPopoverTrigger]',
  standalone: true,
  host: { '(click)': 'toggle()' },
})
export class DsPopoverTrigger {
  readonly popover = input.required<PopoverComponent>({
    alias: 'dsPopoverTrigger',
  });

  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  constructor() {
    afterRenderEffect(() => {
      const popover = this.popover();
      const control = this.control();
      const opened = popover.opened();
      control.setAttribute(
        'aria-haspopup',
        popover.holdsMenu() ? 'menu' : 'dialog',
      );
      control.setAttribute('aria-expanded', String(opened));
      if (opened) {
        control.setAttribute('aria-controls', popover.panelId);
      } else {
        control.removeAttribute('aria-controls');
      }
    });
  }

  protected toggle(): void {
    this.popover().toggle(this.control());
  }

  private control(): HTMLElement {
    const host = this.host.nativeElement;
    if (host.matches('button, a[href], [role="button"]')) {
      return host;
    }

    return (
      host.querySelector<HTMLElement>('button, a[href], [role="button"]') ??
      host
    );
  }
}
