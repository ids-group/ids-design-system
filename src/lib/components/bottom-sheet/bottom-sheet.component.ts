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
import { BodyScrollLockService } from '@ids-group-ltd/ids-design-system/overlay';
import { backdropDismiss } from '@ids-group-ltd/ids-design-system/core';
import { DsStaticPreview } from '@ids-group-ltd/ids-design-system/components';

let nextId = 0;

/** Bottom-anchored sheet, the mobile sibling of ds-drawer. Closes on scrim
 * tap, Escape, or a downward drag on the grab strip. While open it locks
 * body scroll. On wide viewports the panel is capped by
 * --ds-bottom-sheet-max-width and centred. position: fixed resolves against
 * the nearest ancestor containing block, so framed hosts contain the sheet. */
@Component({
  selector: 'ds-bottom-sheet',
  standalone: true,
  imports: [A11yModule],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.scss',
  // Keeps a static `title` attribute from becoming a native tooltip on the host.
  host: { '[attr.title]': 'null' },
  encapsulation: ViewEncapsulation.Emulated,
  hostDirectives: [{ directive: DsStaticPreview, inputs: ['staticPreview'] }],
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
   * Snap-point heights as fractions of viewport height (0-1), ascending,
   * e.g. [0.4, 0.9]. The sheet opens at the first snap point; dragging snaps to the
   * nearest point; dragging below the lowest closes. Empty (default) means a single height.
   */
  readonly snapPoints = input<readonly number[]>([]);

  private readonly doc = inject(DOCUMENT);
  private readonly scrollLock = inject(BodyScrollLockService);
  protected readonly preview = inject(DsStaticPreview);
  private readonly sheetRef = viewChild<ElementRef<HTMLElement>>('sheet');

  protected readonly dragOffset = signal<number | null>(null);
  protected readonly rendered = signal(false);
  protected readonly closing = signal(false);
  protected readonly activeSnapIndex = signal(0);

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
  private wasOpen = false;
  private closeFallbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
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
        if (this.snapPoints().length > 0) {
          this.activeSnapIndex.set(0);
        }
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

  protected close(): void {
    if (this.preview.staticPreview()) {
      return;
    }
    this.dragOffset.set(null);
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

  protected onEscape(): void {
    if (this.open()) {
      this.close();
    }
  }

  protected readonly backdropPress = backdropDismiss();

  protected onBackdropRelease(event: PointerEvent): void {
    if (this.backdropPress.shouldDismiss(event)) {
      this.close();
    }
  }

  protected onGrabStart(event: PointerEvent): void {
    if (this.preview.staticPreview()) {
      return;
    }
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

    const viewportHeight =
      this.doc.defaultView?.innerHeight ?? window.innerHeight;
    const currentIndex = this.activeSnapIndex();
    const currentHeightPx = points[currentIndex] * viewportHeight;
    const targetHeightPx = currentHeightPx - offset;
    const flicked = this.velocity > 0.5;

    if (flicked || targetHeightPx < points[0] * viewportHeight * 0.7) {
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
