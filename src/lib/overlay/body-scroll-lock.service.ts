import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

/**
 * Ref-counted lock on `document.body` scroll, shared by every overlay that
 * covers the viewport (modal, drawer, bottom-sheet). The FIRST `lock()` saves
 * the current `body` overflow and hides it; the LAST `unlock()` restores it —
 * so closing one overlay never re-enables page scroll while another stacked on
 * top of it is still open. Calls must be paired (one `unlock()` per `lock()`).
 */
@Injectable({ providedIn: 'root' })
export class BodyScrollLockService {
  private readonly doc = inject(DOCUMENT);
  private count = 0;
  private previousOverflow = '';

  lock(): void {
    if (this.count === 0) {
      this.previousOverflow = this.doc.body.style.overflow;
      this.doc.body.style.overflow = 'hidden';
    }
    this.count += 1;
  }

  unlock(): void {
    if (this.count === 0) {
      return;
    }
    this.count -= 1;
    if (this.count === 0) {
      this.doc.body.style.overflow = this.previousOverflow;
    }
  }
}
