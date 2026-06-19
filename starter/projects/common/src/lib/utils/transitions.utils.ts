import { inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

/**
 * Toggles a `app-transitions` class on `<body>` around navigations so CSS
 * transitions don't flash when freshly-mounted components animate from their
 * initial to themed values. Call in an injection context (e.g. initializer).
 */
export function initTransitionToggle(): void {
  inject(Router)
    .events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed(),
    )
    .subscribe(() => {
      document.body.classList.remove('app-transitions');
      requestAnimationFrame(() => {
        document.body.classList.add('app-transitions');
      });
    });
}
