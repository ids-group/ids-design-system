import { Directive, inject } from '@angular/core';
import { ButtonComponent } from '@ids-group-ltd/ids-design-system/components/button';
import { ModalComponent } from './modal.component';

/**
 * Marks the confirm action inside a `ds-modal`; pressing it fires the modal's `confirmed`.
 * On a `ds-button` it follows `pressed`, so a disabled or loading button never confirms; on any
 * other element it follows `click` and skips `aria-disabled="true"`. The modal stays open:
 * close it from the `confirmed` handler once the work is done.
 */
@Directive({
  selector: '[dsModalConfirm]',
  standalone: true,
  host: { '(click)': 'onClick($event)' },
})
export class ModalConfirmActionDirective {
  private readonly modal = inject(ModalComponent);
  private readonly button = inject(ButtonComponent, {
    self: true,
    optional: true,
  });

  constructor() {
    this.button?.pressed.subscribe(() => this.modal.confirmed.emit());
  }

  protected onClick(event: MouseEvent): void {
    if (this.button) {
      return;
    }
    const target = event.currentTarget as HTMLElement;
    if (target.getAttribute('aria-disabled') === 'true') {
      return;
    }
    this.modal.confirmed.emit();
  }
}
