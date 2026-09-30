import { InjectionToken, Provider } from '@angular/core';

/** Custom icon name -> SVG body markup (the inside of the host's 24x24 stroke `<svg>`). Omit the `stroke` attribute; the host template sets stroke, caps and joins. */
export type DsIconRegistry = Readonly<Record<string, string>>;

export const DS_ICON_REGISTRY = new InjectionToken<DsIconRegistry>(
  'DS_ICON_REGISTRY',
  {
    factory: () => ({}),
  },
);

/** Register additional icons for `<ds-icon [name]>`. Built-in names win: a clashing consumer name is ignored. */
export function provideDsIcons(icons: DsIconRegistry): Provider {
  return { provide: DS_ICON_REGISTRY, useValue: icons };
}
