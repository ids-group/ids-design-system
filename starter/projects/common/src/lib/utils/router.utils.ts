import {
  ActivatedRouteSnapshot,
  type Routes,
  type ViewTransitionInfo,
} from '@angular/router';

/**
 * Builds an `onViewTransitionCreated` callback that skips view-transitions for
 * same-path navigations and for sibling nav routes (the nav indicator handles
 * those). Sibling routes are derived from the main layout route automatically.
 */
export function createViewTransitionSkip(
  routes: Routes,
): (info: ViewTransitionInfo) => void {
  const siblingNavRoutes = extractSiblingNavRoutes(routes);

  return (info: ViewTransitionInfo): void => {
    const fromPath = collectPath(info.from);
    const toPath = collectPath(info.to);

    if (fromPath === toPath) {
      info.transition.skipTransition();

      return;
    }

    const fromRoot = fromPath.split('/')[0];
    const toRoot = toPath.split('/')[0];

    if (fromRoot === 'auth' && toRoot === 'auth') {
      info.transition.skipTransition();

      return;
    }

    if (
      fromRoot &&
      toRoot &&
      fromRoot !== toRoot &&
      siblingNavRoutes.has(fromRoot) &&
      siblingNavRoutes.has(toRoot)
    ) {
      info.transition.skipTransition();
    }
  };
}

function extractSiblingNavRoutes(routes: Routes): Set<string> {
  const mainRoute = routes.find(
    (r) => r.path === '' && (r.children?.length ?? 0) > 0,
  );

  if (!mainRoute?.children) {
    return new Set();
  }

  return new Set(
    mainRoute.children
      .map((r) => r.path)
      .filter((path): path is string => !!path && path !== '**'),
  );
}

function collectPath(snapshot: ActivatedRouteSnapshot): string {
  const segments: string[] = [];
  let node: ActivatedRouteSnapshot | null = snapshot;

  while (node) {
    segments.push(...node.url.map((segment) => segment.path));
    node = node.firstChild;
  }

  return segments.join('/');
}
