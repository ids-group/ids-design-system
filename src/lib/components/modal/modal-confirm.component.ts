import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ButtonComponent } from '@ids-group-ltd/ids-design-system/components/button';
import type { ButtonColor } from '@ids-group-ltd/ids-design-system/components/button';
import { DS_INTL, retainStyles } from '@ids-group-ltd/ids-design-system/core';
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
  protected readonly intl = inject(DS_INTL);

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

  constructor() {
    retainStyles(ModalConfirmComponent, [
      {
        provide: MODAL_CONFIRM_DATA,
        useValue: { options: {}, resolve: () => undefined },
      },
    ]);
  }

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
