import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, fromEvent } from 'rxjs';

/**
 * Measures the native scrollbar width per device and publishes it as
 * `--ds-scrollbar-width` on `:root` (recomputed on debounced resize; 0 with
 * overlay scrollbars). `ds-app-layout` subtracts it from the content region's
 * right padding. Internal, instantiated by `ds-app-layout`.
 */
@Injectable({ providedIn: 'root' })
export class ScrollbarWidthService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView!;

  readonly width = signal(this.measureWidth());

  constructor() {
    const destroyRef = inject(DestroyRef);

    this.applyToCss(this.width());

    fromEvent(this.window, 'resize')
      .pipe(debounceTime(200), takeUntilDestroyed(destroyRef))
      .subscribe(() => {
        const value = this.measureWidth();
        this.width.set(value);
        this.applyToCss(value);
      });
  }

  private measureWidth(): number {
    const probe = this.document.createElement('div');
    probe.style.cssText =
      'overflow:scroll;width:100px;height:100px;position:absolute;top:-9999px';
    this.document.body.appendChild(probe);

    const inner = this.document.createElement('div');
    inner.style.cssText = 'width:100%;height:1px';
    probe.appendChild(inner);

    const width =
      probe.getBoundingClientRect().width - inner.getBoundingClientRect().width;

    probe.remove();

    return width;
  }

  private applyToCss(value: number): void {
    this.document.documentElement.style.setProperty(
      '--ds-scrollbar-width',
      `${value}px`,
    );
  }
}
