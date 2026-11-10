import { isDevMode } from '@angular/core';
import type { Routes } from '@angular/router';
import { NAV, areaOfPath, urlForGroupPath } from './core/nav.config';

const load = () =>
  import('./sections/section-group.page').then((m) => m.SectionGroupPage);

// A bare area URL (/components, /foundations, …) lands on its first section.
const areaRedirects: Routes = [...new Set(NAV.map((g) => areaOfPath(g.path)))]
  .filter((area) => area !== '' && area !== 'changelog')
  .map((area) => {
    const firstGroup = NAV.find((g) => areaOfPath(g.path) === area);

    return {
      path: area,
      pathMatch: 'full' as const,
      redirectTo: urlForGroupPath(firstGroup!.path),
    };
  });

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: load, data: { path: '' } },
  { path: 'changelog', loadComponent: load, data: { path: 'changelog' } },
  ...areaRedirects,
  // A regression harness driven by tools/*-harness.mjs; dev server only, never deployed.
  ...(isDevMode()
    ? [
        {
          path: 'harness/table-clip',
          loadComponent: () =>
            import('./harness/table-clip.page').then(
              (m) => m.TableClipHarnessPage,
            ),
        },
        {
          path: 'harness/table-print',
          loadComponent: () =>
            import('./harness/table-print.page').then(
              (m) => m.TablePrintHarnessPage,
            ),
        },
        {
          path: 'harness/chat-steps-reveal',
          loadComponent: () =>
            import('./harness/chat-steps-reveal.page').then(
              (m) => m.ChatStepsRevealHarnessPage,
            ),
        },
        {
          path: 'harness/chat-input-placeholder',
          loadComponent: () =>
            import('./harness/chat-input-placeholder.page').then(
              (m) => m.ChatInputPlaceholderHarnessPage,
            ),
        },
        {
          path: 'harness/chat-input-busy-action',
          loadComponent: () =>
            import('./harness/chat-input-busy-action.page').then(
              (m) => m.ChatInputBusyActionHarnessPage,
            ),
        },
        {
          path: 'harness/density-overlay',
          loadComponent: () =>
            import('./harness/density-overlay.page').then(
              (m) => m.DensityOverlayHarnessPage,
            ),
        },
        {
          path: 'harness/splitter-iframe',
          loadComponent: () =>
            import('./harness/splitter-iframe.page').then(
              (m) => m.SplitterIframeHarnessPage,
            ),
        },
        {
          path: 'harness/splitter-fog',
          loadComponent: () =>
            import('./harness/splitter-fog.page').then(
              (m) => m.SplitterFogHarnessPage,
            ),
        },
        {
          path: 'harness/tree-toggle',
          loadComponent: () =>
            import('./harness/tree-toggle.page').then(
              (m) => m.TreeToggleHarnessPage,
            ),
        },
      ]
    : []),
  { path: ':area/:anchor', loadComponent: load },
  { path: '**', redirectTo: '' },
];
