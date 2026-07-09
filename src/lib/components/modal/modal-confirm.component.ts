import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ButtonComponent } from '../button/button.component';
import type { ButtonColor } from '../button/button.types';
import { ModalCardComponent } from './modal-card.component';
import { MODAL_CONFIRM_DATA } from './modal-confirm.types';

let nextId = 0;

@Component({
  selector: 'ds-modal-confirm',
  standalone: true,
  imports: [CdkTrapFocus, ButtonComponent, ModalCardComponent],
  templateUrl: './modal-confirm.component.html',
  styleUrl: './modal-confirm.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class ModalConfirmComponent {
  private readonly context = inject(MODAL_CONFIRM_DATA);

  protected readonly options = this.context.options;
  protected readonly tone = this.options.tone ?? 'default';
  protected readonly confirmColor: ButtonColor =
    this.tone === 'error' ? 'error' : 'primary';

  protected readonly uid = `ds-modal-confirm-${++nextId}`;
  protected readonly messageId = `${this.uid}-message`;

  protected readonly typed = signal('');
  protected readonly confirmDisabled = computed(() => {
    const phrase = this.options.typeToConfirm;

    return !!phrase && this.typed() !== phrase;
  });

  protected onType(event: Event): void {
    this.typed.set((event.target as HTMLInputElement).value);
  }

  protected confirm(): void {
    if (this.confirmDisabled()) {
      return;
    }
    this.context.resolve(true);
  }

  protected cancel(): void {
    this.context.resolve(false);
  }
}
