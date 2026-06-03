import { Component, ViewEncapsulation, computed, input, output } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
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
  readonly size = input<ModalSize>('md');
  readonly danger = input<boolean>(false);
  readonly title = input.required<string>();
  readonly showClose = input<boolean>(true);
  readonly closed = output<void>();

  protected readonly titleId = `ds-modal-title-${++nextId}`;

  protected readonly classes = computed(() => {
    const parts = ['modal', this.size()];
    if (this.danger()) parts.push('danger');
    return parts.join(' ');
  });

  protected onClose(): void {
    this.closed.emit();
  }
}
