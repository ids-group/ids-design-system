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
    desc: 'Cards, tables, sheets, toolbars - the standard content surface.',
  },
  {
    token: '--surface-secondary',
    name: 'Secondary',
    desc: 'Hover lanes, table heads, code blocks, addon backgrounds.',
  },
  {
    token: '--surface-muted',
    name: 'Muted',
    desc: 'Pressed lanes, tracks, skeleton, chip fills.',
  },
  {
    token: '--surface-overlay',
    name: 'Overlay',
    desc: 'Modals, drawers, popovers, dropdowns, toasts.',
  },
  {
    token: '--surface-inverted',
    name: 'Inverted',
    desc: 'Bulk-action bar, dark callouts.',
  },
  {
    token: '--surface-inverted-hover',
    name: 'Inverted hover',
    desc: 'Hover on an inverted surface (bulk-action bar buttons).',
  },
  {
    token: '--surface-tint',
    name: 'Tint',
    desc: 'Brand-tinted selection: active list/tree rows, empty-state badge; follows ds-color via --accent-surface-tint.',
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
