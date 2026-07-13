import {
  Component,
  type OnDestroy,
  ViewEncapsulation,
  booleanAttribute,
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
export class ModalComponent implements OnDestroy {
  private readonly doc = inject(DOCUMENT);
  protected readonly preview = inject(DsStaticPreview);

  readonly open = model<boolean>(false);
  readonly size = input<ModalSize>('md');
  readonly error = input(false, { transform: booleanAttribute });
  readonly title = input.required<string>();
  readonly closed = output<void>();
  readonly confirmed = output<void>();
  /** When false, clicking the scrim does not close the modal. */
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });
  /** When true, neither backdrop click nor Escape closes the modal — only programmatic or explicit close button. */
  readonly persistent = input(false, { transform: booleanAttribute });

  /** Dialog is in the DOM (kept true through the leave animation). */
  protected readonly rendered = signal(false);
  /** Playing the scrim fade-out leave animation. */
  protected readonly closing = signal(false);
  private wasOpen = false;
  private closeFallbackTimer: ReturnType<typeof setTimeout> | undefined;

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
        clearTimeout(this.closeFallbackTimer);
      } else if (this.wasOpen) {
        this.closing.set(true);
        // Chrome freezes CSS animations on a backgrounded tab, so animationend
        // may never fire — this synthetic fallback guarantees teardown anyway.
        clearTimeout(this.closeFallbackTimer);
        this.closeFallbackTimer = setTimeout(() => this.finishClose(), 300);
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
  }

  ngOnDestroy(): void {
    // Restore body scroll if the host is torn down mid-open.
    this.doc.body.style.overflow = '';
    clearTimeout(this.closeFallbackTimer);
  }

  protected onClose(): void {
    if (this.preview.staticPreview()) {
      return;
    }
    this.open.set(false);
  }

  protected onLeaveEnd(event: AnimationEvent): void {
    // Angular scopes @keyframes names under emulated encapsulation, so
    // event.animationName arrives as `_ngcontent-…_modal-out`, not the bare
    // name — match the suffix or teardown never fires and the lock leaks.
    if (!event.animationName.endsWith('modal-out')) {
      return;
    }
    this.finishClose();
  }

  private finishClose(): void {
    if (!this.closing()) {
      return;
    }
    clearTimeout(this.closeFallbackTimer);
    this.closing.set(false);
    this.rendered.set(false);
    this.closed.emit();
  }

  protected onBackdrop(event: MouseEvent): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (this.persistent() || !this.closeOnBackdrop()) {
      return;
    }
    this.onClose();
  }

  protected onEscape(): void {
    if (this.persistent()) {
      return;
    }
    this.onClose();
  }
}
