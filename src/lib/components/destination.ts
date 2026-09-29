import { computed, inject, type Signal } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  UrlTree,
  type IsActiveMatchOptions,
  type Params,
  type QueryParamsHandling,
} from '@angular/router';

export type DsDestination = 'routerLink' | 'href' | 'button';

// The query string is a subset match and the fragment is ignored in both: a sort order, a page
// number or an open accordion does not make it a different page.
const EXACT_PATH: Partial<IsActiveMatchOptions> = {
  paths: 'exact',
  queryParams: 'subset',
  fragment: 'ignored',
  matrixParams: 'ignored',
};
const PREFIX_PATH: Partial<IsActiveMatchOptions> = {
  ...EXACT_PATH,
  paths: 'subset',
};

/** What a `routerLink` input accepts. A `UrlTree` (from `Router.createUrlTree`) carries the
 *  fragment, query and relative base the string and command-array forms cannot. */
export type DsRouterLink = string | readonly unknown[] | UrlTree | null;

/** The values `aria-current` may take. `true` rather than `'true'` so it drops straight into
 *  `RouterLinkActive.ariaCurrentWhenActive`. */
export type DsAriaCurrent =
  | 'page'
  | 'step'
  | 'location'
  | 'date'
  | 'time'
  | true;

/** The `UrlCreationOptions` a navigating control forwards. */
export interface DsLinkModifiers {
  fragment?: string;
  queryParams?: Params | null;
  queryParamsHandling?: QueryParamsHandling | null;
}

/**
 * No destination is a `<button>`, never an `<a href="#">`: a `#` href navigates, rewriting the URL
 * and discarding the scroll position. Only the decision is shared; a shared template would need a
 * wrapper that changes the control's box.
 *
 * @internal
 */
export function dsDestination(
  routerLink: Signal<DsRouterLink>,
  href: Signal<string>,
): Signal<DsDestination> {
  return computed(() => {
    if (routerLink() !== null) {
      return 'routerLink';
    }

    return href() ? 'href' : 'button';
  });
}

/**
 * What a navigating control announces: an exact match is `page`, a prefix match is `true` (the
 * current section or an ancestor), anything else stays silent. `routerLinkActive` matches by
 * PREFIX, so deriving `page` from it makes a "back to the section" link claim to be the current page.
 *
 * Feed the result to `RouterLinkActive.ariaCurrentWhenActive`, never to `[attr.aria-current]`: the
 * directive removes that attribute in a microtask whenever its own input is unset, wiping a
 * template binding. A narrowed `routerLinkActiveOptions` therefore narrows the announcement too.
 *
 * Must be called from an injection context. Outside a router it returns the override or
 * `undefined`.
 *
 * @internal
 */
export function dsAriaCurrent(
  routerLink: Signal<DsRouterLink>,
  modifiers: Signal<DsLinkModifiers>,
  override: Signal<DsAriaCurrent | null | undefined>,
): Signal<DsAriaCurrent | undefined> {
  const router = inject(Router, { optional: true });
  // `RouterLink` resolves relative commands against its own route. Without the same base, `.`
  // would land on `/`, a prefix of every page, and the current page would announce `true`.
  const route = inject(ActivatedRoute, { optional: true });

  return computed<DsAriaCurrent | undefined>(() => {
    // `null` means "announce nothing"; the directive spells that `undefined`.
    const explicit = override();
    if (explicit !== undefined) {
      return explicit ?? undefined;
    }

    const link = routerLink();
    if (!router || link === null) {
      return undefined;
    }

    const tree =
      link instanceof UrlTree
        ? link
        : router.createUrlTree(Array.isArray(link) ? [...link] : [link], {
            relativeTo: route ?? undefined,
            ...modifiers(),
          });

    // `lastSuccessfulNavigation` is only the reactive trigger. `Router.isActive` (deprecated in
    // 21.1, no public replacement) reads the LIVE url; the standalone `isActive()` compares
    // against the navigation's `finalUrl`, so an app that rewrites its path without navigating
    // would keep announcing the page it landed on.
    router.lastSuccessfulNavigation();

    return router.isActive(tree, EXACT_PATH)
      ? 'page'
      : router.isActive(tree, PREFIX_PATH)
        ? true
        : undefined;
  });
}
