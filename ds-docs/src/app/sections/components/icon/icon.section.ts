import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent, type IconName } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

interface IconSize {
  readonly token: string;
  readonly px: number;
  readonly use: string;
}

const SIZES: readonly IconSize[] = [
  { token: '--icon-2xs', px: 10, use: 'Tight inline, badge close' },
  { token: '--icon-xs', px: 12, use: 'Inline meta, tag close' },
  { token: '--icon-sm', px: 14, use: 'Compact buttons, dense tables' },
  { token: '--icon-md', px: 16, use: 'UI default' },
  { token: '--icon-lg', px: 20, use: 'Sidenav, larger buttons' },
];

const SAMPLES: readonly IconName[] = [
  'search',
  'calendar',
  'truck',
  'box',
  'users',
  'map',
  'activity',
  'settings',
  'bell',
  'chart',
  'filter',
  'edit',
];

@Component({
  selector: 'section-components-icon',
  standalone: true,
  imports: [
    DocsSectionComponent,
    DocsTruncationComponent,
    IconComponent,
    RouterLink,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './icon.section.html',
  styleUrl: './icon.section.scss',
})
export class IconSection {
  protected readonly sizes = SIZES;
  protected readonly samples = SAMPLES;
  protected readonly strokes = [1.5, 1.75, 2] as const;
  protected readonly compareSizes = [16, 20, 24] as const;
  protected readonly compareSamples: readonly IconName[] = [
    'search',
    'settings',
    'bell',
    'chart',
    'edit',
    'truck',
  ];

  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Glyph',
      behaviour:
        'Never clipped — the SVG sits in a square frame at one of the fixed sizes.',
    },
    {
      field: 'Icon + text pair',
      behaviour:
        'Glyph fixed; text label takes the remaining width and clips with ellipsis.',
    },
  ];
}
