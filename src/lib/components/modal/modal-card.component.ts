import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import type { ModalSize } from './modal.types';

let nextId = 0;

@Component({
  selector: 'ds-modal-card',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './modal-card.component.html',
  styleUrl: './modal.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class ModalCardComponent {
  /** Card width — sm/md/lg/xl/fullscreen. */
  readonly size = input<ModalSize>('md');
  /** Renders the error styling (icon badge and card accent). */
  readonly error = input(false, { transform: booleanAttribute });
  /** Card title, shown in the header and used for `aria-labelledby`. */
  readonly title = input.required<string>();
  /** Secondary line under the title. Not part of the accessible name. */
  readonly subtitle = input<string | null>(null);
  /** Shows the header close button. */
  readonly showClose = input(true, { transform: booleanAttribute });
  /** Icon badge shown next to the title. */
  readonly icon = input<IconName | null>(null);
  /** ARIA role for the dialog element. */
  readonly dialogRole = input<'dialog' | 'alertdialog'>('dialog');
  /** Fires when the header close button is clicked. */
  readonly closed = output<void>();

  protected readonly titleId = `ds-modal-title-${++nextId}`;

  protected readonly classes = computed(() => {
    const parts = ['modal', this.size()];
    if (this.error()) {
      parts.push('error');
    }

    return parts.join(' ');
  });

  protected onClose(): void {
    this.closed.emit();
  }
}
