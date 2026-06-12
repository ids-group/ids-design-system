import { Directive, booleanAttribute, input } from '@angular/core';

/** Showcase-only: renders the component's open/overlay surface inline in normal
 *  flow instead of its real overlay mechanics (for static docs specimens).
 *  Not part of the production contract. */
@Directive({ standalone: true })
export class DsStaticPreview {
  readonly staticPreview = input(false, { transform: booleanAttribute });
}
