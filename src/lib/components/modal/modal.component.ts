import { Component, ViewEncapsulation, input, model, output } from '@angular/core';
import { ModalCardComponent } from './modal-card.component';
import type { ModalSize } from './modal.types';

@Component({
  selector: 'ds-modal',
  standalone: true,
  imports: [ModalCardComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class ModalComponent {
  readonly open = model<boolean>(false);
  readonly size = input<ModalSize>('md');
  readonly danger = input<boolean>(false);
  readonly title = input.required<string>();
  readonly closed = output<void>();
  readonly confirmed = output<void>();

  protected onClose(): void {
    this.open.set(false);
    this.closed.emit();
  }

  protected onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onClose();
  }
}
