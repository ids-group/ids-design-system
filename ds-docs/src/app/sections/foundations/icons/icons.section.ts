import { Component, ViewEncapsulation } from '@angular/core';
import { ICONS } from 'ds/core';
import type { IconName } from 'ds/core';
import { IconComponent } from 'ds/icons';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface SizeRow {
  readonly name: string;
  readonly token: string;
  readonly px: number;
  readonly use: string;
}

const SIZES: readonly SizeRow[] = [
  {
    name: '2xs',
    token: '--icon-2xs',
    px: 10,
    use: 'Chart legend dot, micro meta',
  },
  { name: 'xs', token: '--icon-xs', px: 12, use: 'Inline meta, tag close' },
  {
    name: 'sm',
    token: '--icon-sm',
    px: 14,
    use: 'Compact buttons, dense tables',
  },
  { name: 'md', token: '--icon-md', px: 16, use: 'UI default' },
  { name: 'lg', token: '--icon-lg', px: 20, use: 'Sidenav, larger buttons' },];

@Component({
  selector: 'section-foundations-icons',
  standalone: true,
  imports: [DocsSectionComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './icons.section.html',
  styleUrl: './icons.section.scss',
})
export class IconsSection {
  protected readonly names = Object.keys(ICONS) as IconName[];
  protected readonly sizes = SIZES;
}
