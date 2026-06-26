import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../../icons/icon.component';
import { CONFIRM_DATA } from './confirm.types';

let nextId = 0;

@Component({
  selector: 'ds-confirm-dialog',
  standalone: true,
  imports: [CdkTrapFocus, ButtonComponent, IconComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class ConfirmDialogComponent {
  private readonly context = inject(CONFIRM_DATA);

  protected readonly options = this.context.options;
  protected readonly tone = this.options.tone ?? 'default';
  protected readonly confirmVariant =
    this.tone === 'danger' ? 'error' : 'primary';

  protected readonly uid = `ds-confirm-${++nextId}`;
  protected readonly titleId = `${this.uid}-title`;
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
