import { Component, ViewEncapsulation } from '@angular/core';
import { DividerComponent } from 'ds/divider';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface WidthRow {
  readonly token: string;
  readonly value: string;
  readonly use: string;
}

interface RoleRow {
  readonly token: string;
  readonly use: string;
}

const WIDTHS: readonly WidthRow[] = [
  {
    token: '--border-width-default',
    value: '1 px',
    use: 'Every border, divider, field outline',
  },
  {
    token: '--border-width-strong',
    value: '2 px',
    use: 'Radio dot, slider thumb, tabs underline, dropzone dash',
  },
];

const ROLES: readonly RoleRow[] = [
  {
    token: '--border-default',
    use: 'Card / table cell / divider-weight outline',
  },
  { token: '--border-strong', use: 'Emphasised separation' },
  {
    token: '--border-field',
    use: 'Standalone field and control outline at rest, 3:1 against the page',
  },
  {
    token: '--border-field-hover',
    use: 'Field and toggle button outline on hover',
  },
  { token: '--border-subtitle', use: 'Faint section separation inside cards' },
  { token: '--border-divider', use: 'Horizontal rules, list-row separators' },
  { token: '--border-inverted', use: 'Borders on dark surfaces' },
  { token: '--border-disabled', use: 'Disabled field / card outlines' },
];

@Component({
  selector: 'section-foundations-borders',
  standalone: true,
  imports: [DividerComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './borders.section.html',
  styleUrl: './borders.section.scss',
})
export class BordersSection {
  protected readonly widths = WIDTHS;
  protected readonly roles = ROLES;
}
