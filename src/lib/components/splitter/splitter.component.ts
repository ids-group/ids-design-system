import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  NgZone,
  OnInit,
  ViewEncapsulation,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';
import {
  DS_INTL,
  DS_INTL_DEFAULTS,
  retainStyles,
} from '@ids-group-ltd/ids-design-system/core';
import { SplitterDraggingStylesComponent } from './splitter-dragging-styles.component';
import type { SplitterOrientation, SplitterPane } from './splitter.types';

const STEP = 16;
const LARGE_STEP = 64;

/**
 * Two panes with a handle between them that resizes one of them. Slots: `[start]` and `[end]`.
 * Drag the handle, or focus it and use the arrow keys (Shift or PageUp / PageDown for a large step,
 * Home / End for the limits); a double click returns to `defaultSize`. Give the splitter a size: it
 * fills the box its parent gives it and never grows to its content.
 */
@Component({
  selector: 'ds-splitter',
  standalone: true,
  templateUrl: './splitter.component.html',
  styleUrl: './splitter.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-pane]': 'pane()',
    '[style.--_splitter-size]': 'current() + "px"',
  },
})
export class SplitterComponent implements OnInit, OnDestroy {
  private readonly intl = inject(DS_INTL);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly handle =
    viewChild.required<ElementRef<HTMLElement>>('handle');

  /** `'horizontal'`: panes side by side. `'vertical'`: panes stacked. */
  readonly orientation = input<SplitterOrientation>('horizontal');
  /** The pane `size` measures; the other pane takes the rest. */
  readonly pane = input<SplitterPane>('start');
  /** Size of `pane` in px, two-way bound; `null` shows `defaultSize`. A drag writes it once, on release. */
  readonly size = model<number | null>(null);
  /** Size in px when `size` is `null`, and what a double click on the handle returns to. */
  readonly defaultSize = input(320, { transform: numberAttribute });
  /** Smallest size in px, inclusive. */
  readonly min = input(160, { transform: numberAttribute });
  /** Largest size in px, inclusive. The pane never takes more than the splitter less the handle. */
  readonly max = input(640, { transform: numberAttribute });
  /** Saves the size in `localStorage` under `ds-splitter:<key>` and restores it on init, over `size`. */
  readonly persistKey = input<string>('');
  /** Accessible name of the handle; unset falls back to `DS_INTL.splitter.label`. Name what it resizes. */
  readonly ariaLabel = input<string | null>(null);

  protected readonly startId = nextControlId('ds-splitter-pane');
  protected readonly endId = nextControlId('ds-splitter-pane');
  protected readonly dragging = signal(false);
  protected readonly current = computed(() =>
    this.clamp(this.size() ?? this.defaultSize(), this.max()),
  );
  protected readonly cursor = computed(() => this.cursorFor(this.current()));
  protected readonly label = computed(
    () =>
      this.ariaLabel() ||
      this.intl().splitter?.label ||
      DS_INTL_DEFAULTS.splitter.label,
  );
  // ARIA names the orientation of the separator line, which is across the panes' axis.
  protected readonly lineOrientation = computed(() =>
    this.orientation() === 'horizontal' ? 'vertical' : 'horizontal',
  );

  private drag: { pointerId: number; grab: number; size: number } | null = null;

  constructor() {
    retainStyles(SplitterDraggingStylesComponent);
  }

  ngOnInit(): void {
    const key = this.storageKey();
    if (!key) {
      return;
    }
    try {
      const stored = Number(localStorage.getItem(key) ?? NaN);
      if (Number.isFinite(stored)) {
        this.size.set(stored);
      }
    } catch {
      // Storage blocked or absent (SSR): keep the bound size.
    }
  }

  ngOnDestroy(): void {
    this.endDrag();
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    const handle = this.handle().nativeElement;
    handle.setPointerCapture(event.pointerId);
    // The grab point's distance from the measured pane's edge stays fixed, so the handle never jumps.
    const box = handle.getBoundingClientRect();
    this.drag = {
      pointerId: event.pointerId,
      grab: this.fromPaneEdge(event, box),
      size: this.current(),
    };
    this.dragging.set(true);
    // Outside Angular: a move writes the DOM itself, so it must not start change detection per frame.
    this.zone.runOutsideAngular(() =>
      handle.addEventListener('pointermove', this.onPointerMove),
    );
    const root = this.document.documentElement;
    root.setAttribute('data-ds-splitter-dragging', '');
    root.style.setProperty('--_ds-splitter-cursor', this.cursor());
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.drag?.pointerId) {
      return;
    }
    const box = this.panesBox();
    const size = this.clampToBox(
      Math.round(this.fromPaneEdge(event, box) - this.drag.grab),
    );
    if (size === this.drag.size) {
      return;
    }
    this.drag.size = size;
    // Written straight to the DOM: no change detection per frame. `size` is set once, on release.
    const cursor = this.cursorFor(size);
    const handle = this.handle().nativeElement;
    this.host.nativeElement.style.setProperty('--_splitter-size', `${size}px`);
    handle.setAttribute('aria-valuenow', String(size));
    handle.style.cursor = cursor;
    this.document.documentElement.style.setProperty(
      '--_ds-splitter-cursor',
      cursor,
    );
  };

  protected onPointerUp(event: PointerEvent): void {
    if (event.pointerId !== this.drag?.pointerId) {
      return;
    }
    const { size } = this.drag;
    this.endDrag();
    if (size !== this.current()) {
      this.commit(size);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const horizontal = this.orientation() === 'horizontal';
    // An arrow moves the handle; the end pane grows as the handle moves towards the start.
    const towardsEnd = this.pane() === 'start' ? 1 : -1;
    const step = event.shiftKey ? LARGE_STEP : STEP;
    const now = this.current();
    const next: Record<string, number> = {
      [horizontal ? 'ArrowRight' : 'ArrowDown']: now + step * towardsEnd,
      [horizontal ? 'ArrowLeft' : 'ArrowUp']: now - step * towardsEnd,
      PageUp: now + LARGE_STEP,
      PageDown: now - LARGE_STEP,
      Home: this.min(),
      End: this.max(),
    };
    if (!(event.key in next)) {
      return;
    }
    event.preventDefault();
    this.commit(this.clampToBox(next[event.key]));
  }

  protected reset(): void {
    this.size.set(null);
    const key = this.storageKey();
    if (key) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Storage blocked: the reset still applies for this session.
      }
    }
  }

  private commit(size: number): void {
    this.size.set(size);
    const key = this.storageKey();
    if (key) {
      try {
        localStorage.setItem(key, String(size));
      } catch {
        // Full or blocked: a lost pane size is not worth an error.
      }
    }
  }

  private endDrag(): void {
    if (!this.drag) {
      return;
    }
    const handle = this.handle().nativeElement;
    handle.removeEventListener('pointermove', this.onPointerMove);
    try {
      handle.releasePointerCapture(this.drag.pointerId);
    } catch {
      // The pointer can already be gone.
    }
    this.drag = null;
    this.dragging.set(false);
    const root = this.document.documentElement;
    root.removeAttribute('data-ds-splitter-dragging');
    root.style.removeProperty('--_ds-splitter-cursor');
  }

  private storageKey(): string | null {
    const key = this.persistKey().trim();

    return key ? `ds-splitter:${key}` : null;
  }

  // ponytail: left-to-right only; under `dir="rtl"` a horizontal start pane is measured from the left.
  private fromPaneEdge(event: PointerEvent, box: DOMRect): number {
    const horizontal = this.orientation() === 'horizontal';
    if (this.pane() === 'start') {
      return horizontal ? event.clientX - box.left : event.clientY - box.top;
    }

    return horizontal ? box.right - event.clientX : box.bottom - event.clientY;
  }

  private clamp(size: number, upper: number): number {
    return Math.max(this.min(), Math.min(upper, size));
  }

  private clampToBox(size: number): number {
    const box = this.panesBox();
    const handle = this.handle().nativeElement;
    const room =
      this.orientation() === 'horizontal'
        ? box.width - handle.offsetWidth
        : box.height - handle.offsetHeight;

    return this.clamp(size, Math.min(this.max(), room));
  }

  // From the start pane's leading edge to the end pane's trailing edge: the host's border and
  // padding lie outside it.
  private panesBox(): DOMRect {
    const handle = this.handle().nativeElement;
    const start = (
      handle.previousElementSibling as HTMLElement
    ).getBoundingClientRect();
    const end = (
      handle.nextElementSibling as HTMLElement
    ).getBoundingClientRect();

    return new DOMRect(
      start.left,
      start.top,
      end.right - start.left,
      end.bottom - start.top,
    );
  }

  // At a limit the cursor shows the one direction the handle can still move.
  private cursorFor(size: number): string {
    const horizontal = this.orientation() === 'horizontal';
    const atMin = size <= this.min();
    if (!atMin && size < this.max()) {
      return horizontal ? 'col-resize' : 'row-resize';
    }
    const towardsEnd = this.pane() === 'start' ? atMin : !atMin;
    if (horizontal) {
      return towardsEnd ? 'e-resize' : 'w-resize';
    }

    return towardsEnd ? 's-resize' : 'n-resize';
  }
}
