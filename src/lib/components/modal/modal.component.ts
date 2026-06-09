import {
  Component,
  DestroyRef,
  ViewEncapsulation,
  effect,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { ModalCardComponent } from './modal-card.component';
import type { ModalSize } from './modal.types';

@Component({
  selector: 'ds-modal',
  standalone: true,
  imports: [ModalCardComponent, A11yModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class ModalComponent {
  private readonly doc = inject(DOCUMENT);

  readonly open = model<boolean>(false);
  readonly size = input<ModalSize>('md');
  readonly danger = input<boolean>(false);
  readonly title = input.required<string>();
  readonly closed = output<void>();
  readonly confirmed = output<void>();

  constructor() {
    // Lock background scroll while the dialog is open.
    effect(() => {
      this.doc.body.style.overflow = this.open() ? 'hidden' : '';
    });
    inject(DestroyRef).onDestroy(() => {
      this.doc.body.style.overflow = '';
    });
  }

  protected onClose(): void {
    this.open.set(false);
    this.closed.emit();
  }

  protected onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onClose();
  }
}
