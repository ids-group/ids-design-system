import { computed, inject, type Signal } from '@angular/core';
import {
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

/** What a `routerLink` input accepts. A `UrlTree` carries the fragment, query and relative base
 *  the string and command-array forms cannot, so a caller that needs them can build one with
 *  `Router.createUrlTree` instead of reaching for more inputs. */
export type DsRouterLink = string | readonly unknown[] | UrlTree | null;

/** The values `aria-current` is allowed to take, plus `null` for "say nothing". `true` rather than
 *  `'true'` so it drops straight into `RouterLinkActive.ariaCurrentWhenActive`, which is the only
 *  writer of this attribute on a routed link. */
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
 * and discarding the scroll position. Only the decision is shared — each control keeps its own
 * template branches, because a shared one would need a wrapper that changes the control's box.
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
 * What a navigating control should announce, distinguishing the two things `routerLinkActive`
 * cannot tell apart.
 *
 * `routerLinkActive` matches by PREFIX, so deriving `aria-current="page"` from it makes a
 * "back to the section" link claim to be the page the reader is already on. ARIA separates the
 * two: `page` is the page you are on, `true` is the current section or an ancestor of it. So an
 * exact match announces `page`, a prefix match announces `true`, and anything else stays silent —
 * which is correct for a button and for a sidenav item without a branch between them.
 *
 * Feed the result to `RouterLinkActive.ariaCurrentWhenActive`, never to `[attr.aria-current]`: the
 * directive removes that attribute from its host in a microtask whenever its own input is unset,
 * so a template binding is written and then silently wiped. Consequence worth knowing — a narrowed
 * `routerLinkActiveOptions` narrows the announcement with it, because the directive writes nothing
 * while it considers the link inactive.
 *
 * Must be called from an injection context. Outside a router it returns the override or `null`,
 * so a control can render with no router present.
 *
 * @internal
 */
export function dsAriaCurrent(
  routerLink: Signal<DsRouterLink>,
  modifiers: Signal<DsLinkModifiers>,
  override: Signal<DsAriaCurrent | null | undefined>,
): Signal<DsAriaCurrent | undefined> {
  const router = inject(Router, { optional: true });

  return computed<DsAriaCurrent | undefined>(() => {
    // `null` is the consumer's way of saying "announce nothing"; the directive spells that
    // `undefined`, so the two meet here rather than at every call site.
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
            ...modifiers(),
          });

    // `lastSuccessfulNavigation` is only the reactive trigger. The comparison goes through
    // `Router.isActive`, which reads the LIVE url: the standalone `isActive()` helper compares
    // against that navigation's `finalUrl` instead, and an app that rewrites its path without
    // navigating — a docs page tracking the section under the reader, a wizard naming its step —
    // then keeps announcing the page it landed on. Deprecated in 21.1, and nothing public replaces
    // the live-url comparison.
    router.lastSuccessfulNavigation();

    return router.isActive(tree, EXACT_PATH)
      ? 'page'
      : router.isActive(tree, PREFIX_PATH)
        ? true
        : undefined;
  });
}
