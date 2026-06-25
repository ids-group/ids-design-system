import {
  Component,
  DestroyRef,
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
import type { DrawerSize } from './drawer.types';

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
export class DrawerComponent {
  private readonly doc = inject(DOCUMENT);

  readonly open = model<boolean>(false);
  readonly size = input<DrawerSize>('md');
  readonly title = input<string>('');
  readonly closed = output<void>();

  protected readonly titleId = `ds-drawer-title-${++nextId}`;
  /** Panel is in the DOM (kept true through the slide-out). */
  protected readonly rendered = signal(false);
  /** Playing the slide-out + scrim-fade leave animation. */
  protected readonly closing = signal(false);
  private wasOpen = false;

  protected readonly classes = computed(() =>
    this.size() === 'lg' ? 'drawer lg' : 'drawer',
  );

  constructor() {
    // open → DOM lifecycle: opening renders now; closing keeps the panel mounted
    // and flips `closing` so the slide-out can play (teardown in onLeaveEnd).
    effect(() => {
      const isOpen = this.open();
      if (isOpen) {
        this.closing.set(false);
        this.rendered.set(true);
      } else if (this.wasOpen) {
        this.closing.set(true);
      }
      this.wasOpen = isOpen;
    });

    // Lock body scroll while the panel occupies the screen — keyed on `rendered`
    // so the lock survives the leave animation.
    effect(() => {
      this.doc.body.style.overflow = this.rendered() ? 'hidden' : '';
    });
    inject(DestroyRef).onDestroy(() => {
      this.doc.body.style.overflow = '';
    });
  }

  protected onClose(): void {
    this.open.set(false);
  }

  protected onLeaveEnd(event: AnimationEvent): void {
    if (event.animationName !== 'drawer-out' || !this.closing()) {
      return;
    }
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
