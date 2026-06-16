import { Component, ViewEncapsulation } from '@angular/core';
import { DocsTruncationComponent, TruncationRule } from '../../../shared/docs-truncation.component';

interface Tier {
  readonly key: 'ultra-compact' | 'compact' | 'cozy' | 'comfy';
  readonly label: string;
  readonly hit: string;
  readonly use: string;
  readonly wcag: string;
}

const TIERS: readonly Tier[] = [
  {
    key: 'ultra-compact',
    label: 'Ultra-compact',
    hit: '24 px',
    use: 'Financial dashboards, log viewers, dense data grids — keyboard/mouse only, never touch',
    wcag: 'Below WCAG 2.5.8 — opt-in only',
  },
  {
    key: 'compact',
    label: 'Compact',
    hit: '32 px',
    use: 'Power-user desktop screens with high information density (Bulk inventory matrix, Logistics grid)',
    wcag: 'Below WCAG 2.5.5 — desktop-only',
  },
  {
    key: 'cozy',
    label: 'Cozy (default)',
    hit: '40 px',
    use: 'The default. All non-matrix screens.',
    wcag: 'Meets WCAG 2.5.8 (24×24 minimum) with margin',
  },
  {
    key: 'comfy',
    label: 'Comfy',
    hit: '48 px',
    use: 'Field-ops on tablets / touch devices, accessibility preference',
    wcag: 'Meets WCAG 2.5.5 (44×44 enhanced)',
  },
];

@Component({
  selector: 'section-foundations-density',
  standalone: true,
  imports: [DocsTruncationComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './density.section.html',
  styleUrl: './density.section.scss',
})
export class DensitySection {
  protected readonly tiers = TIERS;

  protected readonly truncationRules: TruncationRule[] = [
    { field: 'Sandbox label', behaviour: 'Single line, ellipsis. Tier names are short by design — no wrap needed.' },
    { field: 'Demo button label', behaviour: 'Inherits Button truncation — single line, ellipsis on overflow.' },
    { field: 'Demo list row', behaviour: 'Label single line with ellipsis; trailing meta never clips.' },
  ];
}
