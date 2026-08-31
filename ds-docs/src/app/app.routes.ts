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
  { path: ':area/:anchor', loadComponent: load },
  { path: '**', redirectTo: '' },
];
