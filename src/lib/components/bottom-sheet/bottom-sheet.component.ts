import {
  Component,
  DOCUMENT,
  ElementRef,
  ViewEncapsulation,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';

/** Bottom-anchored sheet — the mobile sibling of ds-drawer. Closes on scrim
 * tap, Escape, or a downward drag on the grab strip. While open it locks
 * body scroll. On wide viewports the panel is capped by
 * --ds-bottom-sheet-maxw and centred; prefer ds-modal / ds-drawer for
 * desktop-first layouts. position: fixed resolves against the nearest
 * ancestor containing block, so framed hosts contain the sheet. */
@Component({
  selector: 'ds-bottom-sheet',
  standalone: true,
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class BottomSheetComponent {
  readonly open = model<boolean>(false);
  readonly title = input<string>('');
  readonly closed = output<void>();

  private readonly doc = inject(DOCUMENT);
  private readonly sheetRef = viewChild<ElementRef<HTMLElement>>('sheet');

  protected readonly dragOffset = signal<number | null>(null);

  private dragStartY = 0;
  private lastMoveY = 0;
  private lastMoveTime = 0;
  private velocity = 0;
  private previousBodyOverflow: string | null = null;

  constructor() {
    effect((onCleanup) => {
      if (!this.open()) return;
      this.previousBodyOverflow = this.doc.body.style.overflow;
      this.doc.body.style.overflow = 'hidden';
      onCleanup(() => {
        this.doc.body.style.overflow = this.previousBodyOverflow ?? '';
        this.previousBodyOverflow = null;
      });
    });
  }

  protected close(): void {
    this.dragOffset.set(null);
    this.open.set(false);
    this.closed.emit();
  }

  protected onEscape(): void {
    if (this.open()) this.close();
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
    if (this.dragOffset() === null) return;
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
    if (offset === null) return;
    const sheetHeight = this.sheetRef()?.nativeElement.offsetHeight ?? 0;
    const pastThreshold = sheetHeight > 0 && offset > sheetHeight * 0.3;
    const flicked = this.velocity > 0.5;
    if (pastThreshold || flicked) {
      this.close();
    } else {
      this.dragOffset.set(null);
    }
  }
}
