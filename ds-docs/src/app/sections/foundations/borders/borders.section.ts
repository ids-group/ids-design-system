import { Component, ViewEncapsulation } from '@angular/core';
import { DividerComponent } from 'ds';

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
  { token: '--border-width-default', value: '1 px', use: 'Every border, divider, field outline' },
  { token: '--border-width-strong',  value: '2 px', use: 'Radio dot, slider thumb, tabs underline, focus ring inner band, dropzone dash' },
];

const ROLES: readonly RoleRow[] = [
  { token: '--border-default',  use: 'Default field / card / table cell' },
  { token: '--border-strong',   use: 'Hover field, emphasised separation' },
  { token: '--border-subtle',   use: 'Faint section separation inside cards' },
  { token: '--border-divider',  use: 'Horizontal rules, list-row separators' },
  { token: '--border-inverted', use: 'Borders on dark surfaces' },
];

@Component({
  selector: 'section-foundations-borders',
  standalone: true,
  imports: [DividerComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './borders.section.html',
  styleUrl: './borders.section.scss',
})
export class BordersSection {
  protected readonly widths = WIDTHS;
  protected readonly roles = ROLES;
}
