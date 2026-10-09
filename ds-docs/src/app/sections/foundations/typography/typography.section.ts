import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface TypeRampRow {
  readonly cls: string;
  readonly sizeToken: string;
  readonly sample: string;
  readonly size: string;
  readonly lineHeight: string;
  readonly weight: string;
  readonly tracking: string;
}

const RAMP: readonly TypeRampRow[] = [
  {
    cls: 't-display',
    sizeToken: '--font-size-display',
    sample: 'Q3 2026',
    size: '64',
    lineHeight: '1.1',
    weight: 'extrabold',
    tracking: 'tight',
  },
  {
    cls: 't-h1',
    sizeToken: '--font-size-h1',
    sample: 'Projects',
    size: '48',
    lineHeight: '1.1',
    weight: 'extrabold',
    tracking: 'tight',
  },
  {
    cls: 't-h2',
    sizeToken: '--font-size-h2',
    sample: 'Project Alpha — Sections',
    size: '36',
    lineHeight: '1.25',
    weight: 'extrabold',
    tracking: 'snug',
  },
  {
    cls: 't-h3',
    sizeToken: '--font-size-h3',
    sample: 'Capacity threshold',
    size: '28',
    lineHeight: '1.25',
    weight: 'extrabold',
    tracking: 'snug',
  },
  {
    cls: 't-h4',
    sizeToken: '--font-size-h4',
    sample: 'Recompute pending',
    size: '22',
    lineHeight: '1.25',
    weight: 'bold',
    tracking: 'normal',
  },
  {
    cls: 't-h5',
    sizeToken: '--font-size-h5',
    sample: 'Allocated resources',
    size: '18',
    lineHeight: '1.25',
    weight: 'bold',
    tracking: 'normal',
  },
  {
    cls: 't-card-title',
    sizeToken: '--card-title-fs',
    sample: 'Weekly capacity',
    size: '22',
    lineHeight: '1.25',
    weight: 'bold',
    tracking: 'normal',
  },
  {
    cls: 't-l',
    sizeToken: '--font-size-l',
    sample:
      'Three schedules and twelve staff rotas will recompute when you save these dates.',
    size: '18',
    lineHeight: '1.4',
    weight: 'regular',
    tracking: 'normal',
  },
  {
    cls: 't-l-bold',
    sizeToken: '--font-size-l',
    sample: 'Three schedules will recompute.',
    size: '18',
    lineHeight: '1.4',
    weight: 'bold',
    tracking: 'normal',
  },
  {
    cls: 't-m',
    sizeToken: '--font-size-m',
    sample: 'Three schedules and twelve staff rotas will recompute.',
    size: '16',
    lineHeight: '1.4',
    weight: 'regular',
    tracking: 'normal',
  },
  {
    cls: 't-m-bold',
    sizeToken: '--font-size-m',
    sample: 'Three schedules will recompute.',
    size: '16',
    lineHeight: '1.4',
    weight: 'bold',
    tracking: 'normal',
  },
  {
    cls: 't-s',
    sizeToken: '--font-size-s',
    sample: 'Sam Carter changed Project Alpha access dates two minutes ago.',
    size: '14',
    lineHeight: '1.4',
    weight: 'regular',
    tracking: 'normal',
  },
  {
    cls: 't-s-bold',
    sizeToken: '--font-size-s',
    sample: 'Access dates changed',
    size: '14',
    lineHeight: '1.4',
    weight: 'bold',
    tracking: 'normal',
  },
  {
    cls: 't-xs',
    sizeToken: '--font-size-xs',
    sample: 'Last synced 4 minutes ago',
    size: '12',
    lineHeight: '1.4',
    weight: 'regular',
    tracking: 'normal',
  },
  {
    cls: 't-xs-bold',
    sizeToken: '--font-size-xs',
    sample: 'Synced',
    size: '12',
    lineHeight: '1.4',
    weight: 'bold',
    tracking: 'normal',
  },
  {
    cls: 't-overline',
    sizeToken: '--font-size-2xs',
    sample: 'Impact summary',
    size: '11',
    lineHeight: '1.4',
    weight: 'bold',
    tracking: 'wider · uppercase',
  },
  {
    cls: 't-caption',
    sizeToken: '--font-size-xs',
    sample: 'Times in Europe/London. Daylight savings auto.',
    size: '12',
    lineHeight: '1.4',
    weight: 'regular',
    tracking: 'normal',
  },
  {
    cls: 't-mono',
    sizeToken: '--font-size-mono',
    sample: 'ORD-2026-0142  12 Main St, City  06:00–22:00',
    size: '13',
    lineHeight: '1.4',
    weight: 'medium',
    tracking: 'normal',
  },
];

@Component({
  selector: 'section-foundations-typography',
  standalone: true,
  imports: [DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './typography.section.html',
  styleUrl: './typography.section.scss',
})
export class TypographySection {
  protected readonly ramp = RAMP;

  protected readonly textClipSnippet = `@use 'styles/text-clip';

.file-name {
  @include text-clip.single-line-ellipsis;
}

.summary {
  @include text-clip.line-clamp(2);
}`;
}
