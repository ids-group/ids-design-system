import { type Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

/** What `dsTabUrl()` hands back: a live index, and the setter to bind. */
export interface DsTabUrlBinding {
  /** Index of the tab the URL currently names; 0 when it names none. */
  readonly index: Signal<number>;
  /** Write the tab at `index` into the URL. Bind to `(selectedIndexChange)`. */
  select(index: number): void;
}

export interface DsTabUrlOptions {
  /** Query parameter carrying the tab name. Defaults to `tab`. */
  readonly param?: string;
}

/**
 * Binds `ds-tabs` to a query parameter, so a tab survives F5, a shared link and
 * the Back button.
 *
 * Opt-in on purpose: `ds-tabs` itself stays router-free, because plenty of tab
 * strips are not routed. Call this from a routed page's injection context and
 * bind both directions:
 *
 * ```ts
 * protected readonly tabs = dsTabUrl(['profile', 'activity', 'billing']);
 * ```
 * ```html
 * <ds-tabs
 *   [selectedIndex]="tabs.index()"
 *   (selectedIndexChange)="tabs.select($event)"
 * >
 * ```
 *
 * It exists because hand-wiring the two directions is what consumers copy, and
 * copying is what fails: in one admin port THREE of the four tabbed screens
 * never got the wiring at all, so F5 and a shared link dropped the reader back
 * onto tab one. Only the screen whose author reached for a helper had it.
 *
 * Two decisions carried over from the consumer implementation this replaces:
 *
 * - **Names in the URL, not indices.** `?tab=activity`, never `?tab=1` —
 *   inserting a tab later would silently repoint every old link.
 * - **The first tab writes no parameter, and every write REPLACES.** A pristine
 *   screen keeps a clean address, and flipping tabs does not fill the history
 *   with entries the Back button has to walk through one at a time.
 *
 * An unknown or missing name resolves to 0 rather than throwing: a URL is user
 * input, and a stale bookmark should land on the first tab, not on an error.
 *
 * Pairs with `ds-app-layout`: the write is query-only, and `pathChanged` ignores
 * those, so switching tabs does not trip the layout's scroll reset.
 */
export function dsTabUrl(
  names: readonly string[],
  options: DsTabUrlOptions = {},
): DsTabUrlBinding {
  const param = options.param ?? 'tab';
  const router = inject(Router);
  const route = inject(ActivatedRoute);

  const current = toSignal(route.queryParamMap, {
    initialValue: route.snapshot.queryParamMap,
  });

  const index = computed(() => {
    const found = names.indexOf(current().get(param) ?? '');

    return found < 0 ? 0 : found;
  });

  const select = (next: number): void => {
    const name = names[next];
    if (name === undefined) {
      return;
    }
    void router.navigate([], {
      relativeTo: route,
      queryParams: { [param]: next === 0 ? null : name },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  };

  return { index, select };
}
