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
import { A11yModule } from '@angular/cdk/a11y';
import { ModalCardComponent } from './modal-card.component';
import { resolveDividers } from './modal-defaults';
import { DsStaticPreview } from '@ids-group-ltd/ids-design-system/components';
import { BodyScrollLockService } from '@ids-group-ltd/ids-design-system/overlay';
import type { ModalSize } from './modal.types';
import type { DsStatus } from '@ids-group-ltd/ids-design-system/core';
import { backdropDismiss } from '@ids-group-ltd/ids-design-system/core';

@Component({
  selector: 'ds-modal',
  standalone: true,
  imports: [ModalCardComponent, A11yModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  // Keeps a static `title` attribute from becoming a native tooltip on the host.
  host: { '[attr.title]': 'null' },
  encapsulation: ViewEncapsulation.Emulated,
  hostDirectives: [{ directive: DsStaticPreview, inputs: ['staticPreview'] }],
})
export class ModalComponent implements OnDestroy {
  private readonly scrollLock = inject(BodyScrollLockService);
  protected readonly preview = inject(DsStaticPreview);

  /** Open state, two-way bound. */
  readonly open = model<boolean>(false);
  /** Dialog width. */
  readonly size = input<ModalSize>('md');
  /** Severity, forwarded to the card. Null (default) is a neutral dialog. `false` and
   *  `undefined` land on null too, so `[status]="isDangerous && 'error'"` binds. */
  readonly status = input<DsStatus | null, DsStatus | false | null | undefined>(
    null,
    { transform: (value) => value || null },
  );
  /** Dialog title, shown in the header and used for `aria-labelledby`. */
  readonly title = input.required<string>();
  /** Secondary line under the title. Not part of the accessible name. */
  readonly subtitle = input<string | null>(null);
  /** Fires once the close (leave) animation finishes. */
  readonly closed = output<void>();
  /** Fires when the projected `dsModalConfirm` action is pressed. The modal stays open. */
  readonly confirmed = output<void>();
  /** Draws the rules under the header and over the actions; off also tightens the vertical padding.
   *  Unset falls back to `DS_CONFIG.modal.dividers`, then `true`. */
  readonly dividers = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });
  /** Resolved here and passed down, so the card cannot disagree if a provider sits between them. */
  readonly dividersResolved = resolveDividers(this.dividers);
  /** When false, clicking the scrim does not close the modal. */
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });
  /** When true, neither backdrop click nor Escape closes the modal. */
  readonly persistent = input(false, { transform: booleanAttribute });

  protected readonly rendered = signal(false);
  protected readonly closing = signal(false);
  private wasOpen = false;
  private closeFallbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Skipped in preview, which is always shown.
    effect(() => {
      if (this.preview.staticPreview()) {
        return;
      }
      const isOpen = this.open();
      if (isOpen) {
        this.closing.set(false);
        this.rendered.set(true);
        clearTimeout(this.closeFallbackTimer ?? undefined);
        this.closeFallbackTimer = null;
      } else if (this.wasOpen) {
        this.closing.set(true);
        // animationend is never delivered on a backgrounded tab (Chrome freezes CSS
        // animations) or for a 0s reduced-motion leave; this timer is the teardown.
        clearTimeout(this.closeFallbackTimer ?? undefined);
        this.closeFallbackTimer = setTimeout(() => this.finishClose(), 300);
      }
      this.wasOpen = isOpen;
    });

    // Ref-counted, so stacked overlays don't unlock each other.
    effect((onCleanup) => {
      if (this.preview.staticPreview() || !this.rendered()) {
        return;
      }
      this.scrollLock.lock();
      onCleanup(() => this.scrollLock.unlock());
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.closeFallbackTimer ?? undefined);
    this.closeFallbackTimer = null;
  }

  protected onClose(): void {
    if (this.preview.staticPreview()) {
      return;
    }
    this.open.set(false);
  }

  protected onLeaveEnd(event: AnimationEvent): void {
    // Host's OWN animationend only; matching the keyframes name would make the exit un-overridable.
    if (event.target !== event.currentTarget) {
      return;
    }
    this.finishClose();
  }

  private finishClose(): void {
    if (!this.closing()) {
      return;
    }
    clearTimeout(this.closeFallbackTimer ?? undefined);
    this.closeFallbackTimer = null;
    this.closing.set(false);
    this.rendered.set(false);
    this.closed.emit();
  }

  protected readonly backdropPress = backdropDismiss();

  protected onBackdropRelease(event: PointerEvent): void {
    if (!this.backdropPress.shouldDismiss(event)) {
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
