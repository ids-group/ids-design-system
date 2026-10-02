import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface Breakpoint {
  readonly token: string;
  readonly px: number;
  readonly desc: string;
}

interface GridTier {
  readonly name: string;
  readonly range: string;
  readonly cols: number;
  readonly gutter: string;
  readonly margin: string;
  readonly cap: string;
}

interface ColumnCap {
  readonly token: string;
  readonly value: string;
  readonly use: string;
}

const BREAKPOINTS: readonly Breakpoint[] = [
  { token: '--bp-xs', px: 480, desc: 'Phone portrait — Team app on the go' },
  { token: '--bp-sm', px: 640, desc: 'Phone landscape, small tablets' },
  { token: '--bp-md', px: 768, desc: 'Tablet portrait — Field-ops dashboard' },
  {
    token: '--bp-lg',
    px: 1024,
    desc: 'Laptop / tablet landscape — minimum planner dashboard',
  },
  {
    token: '--bp-xl',
    px: 1441,
    desc: 'Wide desktop — page-grid wide tier (12 cols, 1280 px content cap)',
  },
  {
    token: '--bp-2xl',
    px: 1536,
    desc: 'Wide desktop — Bulk inventory matrix benefits from this',
  },
];

const TIERS: readonly GridTier[] = [
  {
    name: 'Desktop wide',
    range: '>= 1441 px',
    cols: 12,
    gutter: '--page-gutter-wide',
    margin: '--page-margin-wide',
    cap: '1280 px',
  },
  {
    name: 'Desktop',
    range: '1024-1440 px',
    cols: 12,
    gutter: '--page-gutter-desktop',
    margin: '--page-margin-desktop',
    cap: '1280 px (binds above 1280 px)',
  },
  {
    name: 'Tablet',
    range: '640-1023 px',
    cols: 8,
    gutter: '--page-gutter-tablet',
    margin: '--page-margin-tablet',
    cap: '1280 px (never binds)',
  },
  {
    name: 'Mobile',
    range: '< 640 px',
    cols: 4,
    gutter: '--page-gutter-mobile',
    margin: '--page-margin-mobile',
    cap: '1280 px (never binds)',
  },
];

const COL_CAPS: readonly ColumnCap[] = [
  {
    token: '--col-cap-text',
    value: '720px',
    use: 'Body text never exceeds this — long-form prose, descriptions',
  },
  {
    token: '--col-cap-content',
    value: '1280px',
    use: 'Page content cap at every tier; first binds above 1280 px',
  },
];

@Component({
  selector: 'section-foundations-layout',
  standalone: true,
  imports: [DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './layout.section.html',
  styleUrl: './layout.section.scss',
})
export class LayoutSection {
  protected readonly breakpoints = BREAKPOINTS;
  protected readonly tiers = TIERS;
  protected readonly colCaps = COL_CAPS;

  protected cols(count: number): readonly null[] {
    return Array.from({ length: count }, () => null);
  }
}
