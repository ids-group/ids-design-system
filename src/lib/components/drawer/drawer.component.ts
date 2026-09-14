import {
  Component,
  type OnDestroy,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { BodyScrollLockService } from '@ids-group-ltd/ids-design-system/overlay';
import type { DrawerPlacement } from './drawer.types';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';

let nextId = 0;

@Component({
  selector: 'ds-drawer',
  standalone: true,
  imports: [IconComponent, A11yModule],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  // A static `title="…"` feeding the input below ALSO stays in the DOM as the global attribute,
  // which makes the host a native browser tooltip over everything inside it.
  host: {
    '[attr.title]': 'null',
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class DrawerComponent implements OnDestroy {
  private readonly scrollLock = inject(BodyScrollLockService);

  /** Open state, two-way bound. */
  readonly open = model<boolean>(false);
  /** Panel size — sm/md/lg. */
  readonly size = input<DsSize>('md');
  /** Edge the panel slides in from. */
  readonly placement = input<DrawerPlacement>('right');
  /** Drawer title, shown in the header and used for `aria-labelledby`. */
  readonly title = input.required<string>();
  /** Fires once the close (slide-out) animation finishes. */
  readonly closed = output<void>();

  protected readonly titleId = `ds-drawer-title-${++nextId}`;
  /** Panel is in the DOM (kept true through the slide-out). */
  protected readonly rendered = signal(false);
  /** Playing the slide-out + scrim-fade leave animation. */
  protected readonly closing = signal(false);
  private wasOpen = false;
  private closeFallbackTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly classes = computed(() => {
    const parts = ['drawer', this.placement(), this.size()];

    return parts.join(' ');
  });

  constructor() {
    // open → DOM lifecycle: opening renders now; closing keeps the panel mounted
    // and flips `closing` so the slide-out can play (teardown in onLeaveEnd).
    effect(() => {
      const isOpen = this.open();
      if (isOpen) {
        this.closing.set(false);
        this.rendered.set(true);
        clearTimeout(this.closeFallbackTimer ?? undefined);
        this.closeFallbackTimer = null;
      } else if (this.wasOpen) {
        this.closing.set(true);
        // Chrome freezes CSS animations on a backgrounded tab, so animationend
        // may never fire — this synthetic fallback guarantees teardown anyway.
        clearTimeout(this.closeFallbackTimer ?? undefined);
        this.closeFallbackTimer = setTimeout(() => this.finishClose(), 300);
      }
      this.wasOpen = isOpen;
    });

    // Ref-counted body-scroll lock, shared with modal/bottom-sheet so stacked
    // overlays don't unlock each other. The effect's cleanup fires on the
    // rendered→false transition and on destroy, keeping lock/unlock paired.
    effect((onCleanup) => {
      if (!this.rendered()) {
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
    this.open.set(false);
  }

  protected onLeaveEnd(event: AnimationEvent): void {
    // The panel is the element with the handler, so its OWN animationend is the
    // signal; the scrim is a sibling and anything else is inside. This replaces
    // matching four keyframes NAMES, which is what made the exit un-overridable.
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

  protected onEscape(): void {
    if (this.open()) {
      this.onClose();
    }
  }
}
