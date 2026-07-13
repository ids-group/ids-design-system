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
import { DOCUMENT } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { IconComponent } from '../../icons/icon.component';
import type { DrawerPlacement, DrawerSize } from './drawer.types';

let nextId = 0;

@Component({
  selector: 'ds-drawer',
  standalone: true,
  imports: [IconComponent, A11yModule],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class DrawerComponent implements OnDestroy {
  private readonly doc = inject(DOCUMENT);

  readonly open = model<boolean>(false);
  readonly size = input<DrawerSize>('md');
  readonly placement = input<DrawerPlacement>('right');
  readonly title = input.required<string>();
  readonly closed = output<void>();

  protected readonly titleId = `ds-drawer-title-${++nextId}`;
  /** Panel is in the DOM (kept true through the slide-out). */
  protected readonly rendered = signal(false);
  /** Playing the slide-out + scrim-fade leave animation. */
  protected readonly closing = signal(false);
  private wasOpen = false;
  private closeFallbackTimer: ReturnType<typeof setTimeout> | undefined;

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

    // Lock body scroll while the panel occupies the screen — keyed on `rendered`
    // so the lock survives the leave animation.
    effect(() => {
      this.doc.body.style.overflow = this.rendered() ? 'hidden' : '';
    });
  }

  ngOnDestroy(): void {
    // Restore body scroll if the host is torn down mid-open.
    this.doc.body.style.overflow = '';
    clearTimeout(this.closeFallbackTimer);
  }

  protected onClose(): void {
    this.open.set(false);
  }

  protected onLeaveEnd(event: AnimationEvent): void {
    // Angular scopes @keyframes names under emulated encapsulation, so
    // event.animationName arrives as `_ngcontent-…_drawer-panel-close-right`,
    // not the bare name — match the suffix or teardown never fires.
    if (
      !event.animationName.endsWith('drawer-panel-close-right') &&
      !event.animationName.endsWith('drawer-panel-close-left') &&
      !event.animationName.endsWith('drawer-panel-close-top') &&
      !event.animationName.endsWith('drawer-panel-close-bottom')
    ) {
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

  protected onEscape(): void {
    if (this.open()) {
      this.onClose();
    }
  }
}
