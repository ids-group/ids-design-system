import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NAV, areaOfPath, groupForAnchor } from './nav.config';

const BRAND = 'IDS Design System';

/**
 * `{Record} · {Section} · Brand`, the format `foundations/browser-tab` prescribes: leaf first
 * and brand last, so a row of tabs can be triaged by its left edge. The docs site is the
 * first thing a consumer sees the rule applied to, so it follows its own rule.
 */
@Injectable({ providedIn: 'root' })
export class DocumentTitleService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  start(): void {
    this.apply(this.router.url);
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe((event) => this.apply(event.urlAfterRedirects));
  }

  private apply(url: string): void {
    this.title.setTitle(titleFor(url));
  }
}

export function titleFor(url: string): string {
  const [area, anchor] = url
    .split('?')[0]
    .split('#')[0]
    .replace(/^\//, '')
    .split('/');

  if (!area) {
    return BRAND;
  }
  if (area === 'changelog') {
    return `Changelog · ${BRAND}`;
  }

  const group = anchor ? groupForAnchor(area, anchor) : undefined;
  if (!group) {
    // A bare area (/components) before its redirect resolves, or a url nothing owns.
    const first = NAV.find((candidate) => areaOfPath(candidate.path) === area);

    return first ? `${first.title} · ${BRAND}` : BRAND;
  }

  const item = group.items.find((candidate) => candidate.anchor === anchor);

  return item
    ? `${item.label} · ${group.title} · ${BRAND}`
    : `${group.title} · ${BRAND}`;
}
