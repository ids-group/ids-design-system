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
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import { DsStaticPreview } from '@ids-group-ltd/ids-design-system/components';
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
  // A static `title="..."` also stays in the DOM as the global attribute and would make the host a native tooltip.
  host: {
    '[attr.title]': 'null',
    '(document:keydown.escape)': 'onEscape()',
  },
  hostDirectives: [{ directive: DsStaticPreview, inputs: ['staticPreview'] }],
})
export class DrawerComponent implements OnDestroy {
  private readonly scrollLock = inject(BodyScrollLockService);
  protected readonly intl = inject(DS_INTL);
  protected readonly preview = inject(DsStaticPreview);

  /** Open state, two-way bound. */
  readonly open = model<boolean>(false);
  /** Panel size. */
  readonly size = input<DsSize>('md');
  /** Edge the panel slides in from. */
  readonly placement = input<DrawerPlacement>('right');
  /** Drawer title, shown in the header and used for `aria-labelledby`. */
  readonly title = input.required<string>();
  /** Fires once the close (slide-out) animation finishes. */
  readonly closed = output<void>();

  protected readonly titleId = `ds-drawer-title-${++nextId}`;
  /** In the DOM; stays true through the slide-out. */
  protected readonly rendered = signal(false);
  protected readonly closing = signal(false);
  private wasOpen = false;
  private closeFallbackTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly classes = computed(() => {
    const parts = ['drawer', this.placement(), this.size()];

    return parts.join(' ');
  });

  constructor() {
    // Closing keeps the panel mounted and flips `closing` so the slide-out can play
    // (teardown in onLeaveEnd, or the timer below).
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

    // Ref-counted lock shared with modal/bottom-sheet so stacked overlays don't unlock each other.
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
    // Only the panel's OWN animationend counts. Matching keyframes names would make the
    // exit animation un-overridable.
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
