import { InjectionToken, Provider } from '@angular/core';

/** Map of custom icon name -> raw SVG body markup.
 *
 * The body is what goes *inside* `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">`
 * — typically one or more `<path>` / `<circle>` / `<rect>` elements. Stroke width, line caps and
 * join are applied by the host `<ds-icon>` template, so paths should use `stroke="currentColor"`
 * implicitly (i.e. omit the stroke attribute) and rely on the parent SVG.
 *
 * Example:
 *   provideDsIcons({
 *     'cloud-upload': '<path d="M12 13v8m0-8 3 3m-3-3-3 3"/><path d="..."/>',
 *   })
 */
export type DsIconRegistry = Readonly<Record<string, string>>;

export const DS_ICON_REGISTRY = new InjectionToken<DsIconRegistry>(
  'DS_ICON_REGISTRY',
  {
    factory: () => ({}),
  },
);

/** Register additional icons available to `<ds-icon [name]="...">` alongside the built-in DS set.
 *
 *   providers: [
 *     provideDsIcons({
 *       'cloud-upload': '<path d="..."/>',
 *       'shield':       '<path d="..."/>',
 *     }),
 *   ]
 *
 * Names take precedence as: built-in `ICONS` > consumer registry. Consumer names that clash with
 * built-ins are ignored — to override a built-in, edit the DS source.
 */
export function provideDsIcons(icons: DsIconRegistry): Provider {
  return { provide: DS_ICON_REGISTRY, useValue: icons };
}
