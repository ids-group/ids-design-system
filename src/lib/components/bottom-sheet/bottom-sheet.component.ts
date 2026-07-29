import {
  Component,
  DOCUMENT,
  ElementRef,
  type OnDestroy,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';

let nextId = 0;

/** Bottom-anchored sheet — the mobile sibling of ds-drawer. Closes on scrim
 * tap, Escape, or a downward drag on the grab strip. While open it locks
 * body scroll. On wide viewports the panel is capped by
 * --ds-bottom-sheet-maxw and centred; prefer ds-modal / ds-drawer for
 * desktop-first layouts. position: fixed resolves against the nearest
 * ancestor containing block, so framed hosts contain the sheet. */
@Component({
  selector: 'ds-bottom-sheet',
  standalone: true,
  imports: [A11yModule],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class BottomSheetComponent implements OnDestroy {
  /** Open state, two-way bound. */
  readonly open = model<boolean>(false);
  /** Sheet title, shown in the header and used for `aria-labelledby`. */
  readonly title = input.required<string>();
  /** Fires once the close (leave) animation finishes. */
  readonly closed = output<void>();

  protected readonly titleId = `ds-bottom-sheet-title-${++nextId}`;
  /**
   * Snap-point heights as fractions of viewport height (0–1), ascending.
   * e.g. [0.4, 0.9]. When provided the sheet opens at the first snap point;
   * dragging snaps to the nearest point; dragging below the lowest closes.
   * When empty (default) the original single-height behavior is preserved.
   */
  readonly snapPoints = input<readonly number[]>([]);

  private readonly doc = inject(DOCUMENT);
  private readonly sheetRef = viewChild<ElementRef<HTMLElement>>('sheet');

  protected readonly dragOffset = signal<number | null>(null);
  /** Sheet is in the DOM (kept true through the leave animation). */
  protected readonly rendered = signal(false);
  /** Playing the slide-down + scrim-fade leave animation. */
  protected readonly closing = signal(false);
  /** Index of the currently active snap point (only used when snapPoints is non-empty). */
  protected readonly activeSnapIndex = signal(0);

  /** CSS height string derived from the active snap point, or null when snapPoints is empty. */
  protected readonly snapHeight = computed(() => {
    const points = this.snapPoints();
    if (points.length === 0) {
      return null;
    }
    const index = Math.min(this.activeSnapIndex(), points.length - 1);

    return `${points[index] * 100}vh`;
  });

  private dragStartY = 0;
  private lastMoveY = 0;
  private lastMoveTime = 0;
  private velocity = 0;
  private previousBodyOverflow: string | null = null;
  private wasOpen = false;
  private closeFallbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // open → DOM lifecycle. Opening renders immediately; closing keeps the
    // sheet mounted and flips `closing` so the leave animation can play —
    // teardown happens in onLeaveEnd() once animationend fires.
    effect(() => {
      const isOpen = this.open();
      if (isOpen) {
        this.closing.set(false);
        this.rendered.set(true);
        clearTimeout(this.closeFallbackTimer ?? undefined);
        this.closeFallbackTimer = null;
        if (this.snapPoints().length > 0) {
          this.activeSnapIndex.set(0);
        }
      } else if (this.wasOpen) {
        this.closing.set(true);
        // Chrome freezes CSS animations on a backgrounded tab, so animationend
        // may never fire — this synthetic fallback guarantees teardown anyway.
        clearTimeout(this.closeFallbackTimer ?? undefined);
        this.closeFallbackTimer = setTimeout(() => this.finishClose(), 300);
      }
      this.wasOpen = isOpen;
    });

    // Lock body scroll while the sheet occupies the screen — keyed on
    // `rendered` so the lock survives the leave animation.
    effect((onCleanup) => {
      if (!this.rendered()) {
        return;
      }
      this.previousBodyOverflow = this.doc.body.style.overflow;
      this.doc.body.style.overflow = 'hidden';
      onCleanup(() => {
        this.doc.body.style.overflow = this.previousBodyOverflow ?? '';
        this.previousBodyOverflow = null;
      });
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.closeFallbackTimer ?? undefined);
    this.closeFallbackTimer = null;
  }

  protected close(): void {
    this.dragOffset.set(null);
    this.open.set(false);
  }

  protected onLeaveEnd(event: AnimationEvent): void {
    // Angular scopes @keyframes names under emulated encapsulation, so
    // event.animationName arrives as `_ngcontent-…_ds-sheet-down`, not the bare
    // name — match the suffix or teardown never fires and the lock leaks.
    if (!event.animationName.endsWith('ds-sheet-down')) {
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
      this.close();
    }
  }

  protected stop(event: Event): void {
    event.stopPropagation();
  }

  protected onGrabStart(event: PointerEvent): void {
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.dragStartY = event.clientY;
    this.lastMoveY = event.clientY;
    this.lastMoveTime = event.timeStamp;
    this.velocity = 0;
    this.dragOffset.set(0);
  }

  protected onGrabMove(event: PointerEvent): void {
    if (this.dragOffset() === null) {
      return;
    }
    const deltaTime = event.timeStamp - this.lastMoveTime;
    if (deltaTime > 0) {
      this.velocity = (event.clientY - this.lastMoveY) / deltaTime;
    }
    this.lastMoveY = event.clientY;
    this.lastMoveTime = event.timeStamp;
    this.dragOffset.set(Math.max(0, event.clientY - this.dragStartY));
  }

  protected onGrabEnd(): void {
    const offset = this.dragOffset();
    if (offset === null) {
      return;
    }

    const points = this.snapPoints();

    if (points.length === 0) {
      // Original single-height behavior.
      const sheetHeight = this.sheetRef()?.nativeElement.offsetHeight ?? 0;
      const pastThreshold = sheetHeight > 0 && offset > sheetHeight * 0.3;
      const flicked = this.velocity > 0.5;
      if (pastThreshold || flicked) {
        this.close();
      } else {
        this.dragOffset.set(null);
      }

      return;
    }

    // Snap-point behavior: determine which snap point to land on.
    const viewportHeight =
      this.doc.defaultView?.innerHeight ?? window.innerHeight;
    const currentIndex = this.activeSnapIndex();
    const currentHeightPx = points[currentIndex] * viewportHeight;
    // Positive offset = dragged downward.
    const targetHeightPx = currentHeightPx - offset;
    const flicked = this.velocity > 0.5;

    if (flicked || targetHeightPx < points[0] * viewportHeight * 0.7) {
      // Dragged below lowest snap point or flicked down → close.
      this.close();

      return;
    }

    let nearestIndex = 0;
    let smallestDelta = Infinity;
    for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
      const delta = Math.abs(
        points[pointIndex] * viewportHeight - targetHeightPx,
      );
      if (delta < smallestDelta) {
        smallestDelta = delta;
        nearestIndex = pointIndex;
      }
    }

    this.dragOffset.set(null);
    this.activeSnapIndex.set(nearestIndex);
  }
}
