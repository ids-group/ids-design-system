import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface SurfaceRow {
  readonly token: string;
  readonly name: string;
  readonly desc: string;
}

const SURFACES: readonly SurfaceRow[] = [
  {
    token: '--surface-canvas',
    name: 'Canvas',
    desc: 'Outermost page backdrop. Frames every other surface.',
  },
  {
    token: '--surface-default',
    name: 'Default',
    desc: 'Cards, tables, modals — the standard content surface.',
  },
  {
    token: '--surface-secondary',
    name: 'Secondary',
    desc: 'Hover lanes, table heads, code blocks, addon backgrounds.',
  },
  {
    token: '--surface-overlay',
    name: 'Overlay',
    desc: 'Popovers, dropdowns, toast region — anything CDK-portaled.',
  },
  {
    token: '--surface-inverted',
    name: 'Inverted',
    desc: 'Bulk-action bar, dark callout cards, tooltip background.',
  },
  {
    token: '--surface-tint',
    name: 'Tint',
    desc: 'Brand-tinted callouts (banners, page-footer save state).',
  },
  {
    token: '--surface-disabled',
    name: 'Disabled',
    desc: 'Disabled control fill. Reads as inactive without losing shape.',
  },
  {
    token: '--surface-scrim',
    name: 'Scrim',
    desc: 'Modal/drawer backdrop. Alpha-tinted; never used as a standalone fill.',
  },
];

@Component({
  selector: 'section-foundations-surface-levels',
  standalone: true,
  imports: [DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './surface-levels.section.html',
  styleUrl: './surface-levels.section.scss',
})
export class SurfaceLevelsSection {
  protected readonly surfaces = SURFACES;
}
