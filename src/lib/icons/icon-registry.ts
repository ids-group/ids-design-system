import { InjectionToken, Provider, inject } from '@angular/core';

/** Custom icon name -> SVG body markup (the inside of the host's 24x24 stroke `<svg>`). Omit the `stroke` attribute; the host template sets stroke, caps and joins. */
export type DsIconRegistry = Readonly<Record<string, string>>;

export const DS_ICON_REGISTRY = new InjectionToken<DsIconRegistry>(
  'DS_ICON_REGISTRY',
  {
    factory: () => ({}),
  },
);

const DS_ICON_REGISTRY_LAYERS = new InjectionToken<readonly DsIconRegistry[]>(
  'DS_ICON_REGISTRY_LAYERS',
);

function mergeDsIconLayers(): DsIconRegistry {
  return inject(DS_ICON_REGISTRY_LAYERS, { self: true }).reduce(
    (merged, layer) => ({ ...merged, ...layer }),
    inject(DS_ICON_REGISTRY, { skipSelf: true, optional: true }) ?? {},
  );
}

/** Register additional icons for `<ds-icon [name]>`. Built-in names win: a clashing consumer name is ignored.
 *  Calls add up: sibling calls and a lazy route's call merge with the icons above them, a later
 *  call winning a shared name. */
export function provideDsIcons(icons: DsIconRegistry): Provider {
  return [
    { provide: DS_ICON_REGISTRY_LAYERS, useValue: icons, multi: true },
    { provide: DS_ICON_REGISTRY, useFactory: mergeDsIconLayers },
  ];
}
