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
  // A static `title="…"` feeding the input below ALSO stays in the DOM as the global attribute,
  // which makes the host a native browser tooltip over everything inside it.
  host: { '[attr.title]': 'null' },
  encapsulation: ViewEncapsulation.Emulated,
  hostDirectives: [{ directive: DsStaticPreview, inputs: ['staticPreview'] }],
})
export class ModalComponent implements OnDestroy {
  private readonly scrollLock = inject(BodyScrollLockService);
  protected readonly preview = inject(DsStaticPreview);

  /** Open state, two-way bound. */
  readonly open = model<boolean>(false);
  /** Dialog width — sm/md/lg/xl/fullscreen. */
  readonly size = input<ModalSize>('md');
  /** Severity, forwarded to the card — drives its icon-badge tint, title colour,
   *  default icon and ARIA role. Null (default) is a neutral dialog. `false` and
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
  /** Emit this yourself from a confirm action in the projected content — not fired by the modal itself. */
  readonly confirmed = output<void>();
  /** Draws the rules under the header and over the actions. Turning them off also
   *  tightens the vertical padding they were sized for. Unset falls back to
   *  `DS_CONFIG.modal.dividers`, then `true`. */
  readonly dividers = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });
  /** Resolved here and passed down, so the card is told rather than resolving a
   *  second time — the two would disagree if a provider sat between them. */
  readonly dividersResolved = resolveDividers(this.dividers);
  /** When false, clicking the scrim does not close the modal. */
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });
  /** When true, neither backdrop click nor Escape closes the modal — only programmatic or explicit close button. */
  readonly persistent = input(false, { transform: booleanAttribute });

  /** Dialog is in the DOM (kept true through the leave animation). */
  protected readonly rendered = signal(false);
  /** Playing the scrim fade-out leave animation. */
  protected readonly closing = signal(false);
  private wasOpen = false;
  private closeFallbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // open → DOM lifecycle: opening renders now; closing keeps the dialog mounted
    // so the leave animation can play (teardown in onLeaveEnd, or the timer below).
    // Skipped in preview (always shown).
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
        // Two cases never deliver animationend: Chrome freezes CSS animations on a
        // backgrounded tab, and a 0s reduced-motion leave finishes before a listener
        // hears it. This timer is the teardown guarantee, not belt-and-braces.
        clearTimeout(this.closeFallbackTimer ?? undefined);
        this.closeFallbackTimer = setTimeout(() => this.finishClose(), 300);
      }
      this.wasOpen = isOpen;
    });

    // Ref-counted body-scroll lock, shared with drawer/bottom-sheet so stacked
    // overlays don't unlock each other. The effect's cleanup fires on the
    // rendered→false transition and on destroy, keeping lock/unlock paired.
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
    // The animated element is the one with the handler, so its OWN animationend is
    // the signal; anything bubbling from inside is not. This replaces matching the
    // keyframes NAME, which is what made the exit un-overridable.
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
