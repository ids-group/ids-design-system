import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LastTabService {
  private readonly router = inject(Router);

  remember(index: number): void {
    sessionStorage.setItem(`last-tab:${this.router.url}`, String(index));
  }

  restore(): number {
    return Number(sessionStorage.getItem(`last-tab:${this.router.url}`) ?? 0);
  }
}
