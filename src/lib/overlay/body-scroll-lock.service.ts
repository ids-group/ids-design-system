import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

/**
 * Ref-counted lock on `document.body` scroll for viewport-covering overlays.
 * The first `lock()` saves and hides the body overflow, the last `unlock()`
 * restores it. Calls must be paired.
 */
@Injectable({ providedIn: 'root' })
export class BodyScrollLockService {
  private readonly doc = inject(DOCUMENT);
  private count = 0;
  private previousOverflow = '';

  lock(): void {
    if (this.count === 0) {
      this.previousOverflow = this.doc.body.style.overflow;
      // glyph-clip-guard: locks page scroll on <body>
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
