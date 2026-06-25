import {
  Component,
  DestroyRef,
  ViewEncapsulation,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { ModalCardComponent } from './modal-card.component';
import { DsStaticPreview } from '../static-preview.directive';
import type { ModalSize } from './modal.types';

@Component({
  selector: 'ds-modal',
  standalone: true,
  imports: [ModalCardComponent, A11yModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  hostDirectives: [{ directive: DsStaticPreview, inputs: ['staticPreview'] }],
})
export class ModalComponent {
  private readonly doc = inject(DOCUMENT);
  protected readonly preview = inject(DsStaticPreview);

  readonly open = model<boolean>(false);
  readonly size = input<ModalSize>('md');
  readonly danger = input<boolean>(false);
  readonly title = input.required<string>();
  readonly closed = output<void>();
  readonly confirmed = output<void>();

  /** Dialog is in the DOM (kept true through the leave animation). */
  protected readonly rendered = signal(false);
  /** Playing the scrim fade-out leave animation. */
  protected readonly closing = signal(false);
  private wasOpen = false;

  constructor() {
    // open → DOM lifecycle: opening renders now; closing keeps the dialog mounted
    // so the leave animation can play (teardown in onLeaveEnd). Skipped in preview
    // (always shown). Reduced-motion zeroes the durations → close is instant.
    effect(() => {
      if (this.preview.staticPreview()) {
        return;
      }
      const isOpen = this.open();
      if (isOpen) {
        this.closing.set(false);
        this.rendered.set(true);
      } else if (this.wasOpen) {
        this.closing.set(true);
      }
      this.wasOpen = isOpen;
    });

    // Lock background scroll while the dialog occupies the screen (skipped in
    // preview); keyed on `rendered` so the lock survives the leave animation.
    effect(() => {
      if (this.preview.staticPreview()) {
        return;
      }
      this.doc.body.style.overflow = this.rendered() ? 'hidden' : '';
    });
    inject(DestroyRef).onDestroy(() => {
      this.doc.body.style.overflow = '';
    });
  }

  protected onClose(): void {
    if (this.preview.staticPreview()) {
      return;
    }
    this.open.set(false);
  }

  protected onLeaveEnd(event: AnimationEvent): void {
    if (event.animationName !== 'modal-out' || !this.closing()) {
      return;
    }
    this.closing.set(false);
    this.rendered.set(false);
    this.closed.emit();
  }

  protected onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
