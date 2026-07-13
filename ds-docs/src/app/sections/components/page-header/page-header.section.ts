import { Component, ViewEncapsulation } from '@angular/core';
import {
  BadgeComponent,
  BreadcrumbsComponent,
  ButtonComponent,
  PageHeaderComponent,
  TabsComponent,
  TabComponent,
  type BreadcrumbItem,
} from 'ds';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-page-header',
  standalone: true,
  imports: [
    BadgeComponent,
    BreadcrumbsComponent,
    ButtonComponent,
    PageHeaderComponent,
    TabsComponent,
    TabComponent,
    DocsTruncationComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './page-header.section.html',
  styleUrls: [
    './page-header.section.scss',
    './page-header.section.responsive.scss',
  ],
})
export class PageHeaderSection {
  protected readonly trail: BreadcrumbItem[] = [
    { icon: 'home', href: '#' },
    { label: 'Records', href: '#' },
    { label: '2026 Cycle', href: '#' },
    { label: 'Project Alpha' },
  ];

  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Title',
      behaviour:
        'Single line, ellipsis. Tooltip on hover when clipped — the title carries identity.',
    },
    {
      field: 'Subtitle / lede',
      behaviour: 'Single line, ellipsis. Tooltip on hover when clipped.',
    },
    {
      field: 'Eyebrow',
      behaviour:
        'Single line, no clip — keep eyebrow short by spec. Wraps if forced.',
    },
    {
      field: 'Breadcrumb segment',
      behaviour:
        'Single line, ellipsis at ~24 ch per segment. Middle segments collapse to … before the leaf clips.',
    },
    {
      field: 'Status badge',
      behaviour:
        'Single line, no clip — status labels are short by spec. Max one badge per header.',
    },
    {
      field: 'Action buttons',
      behaviour:
        'Single line, no clip. Beyond two ghost + one primary actions, collapse the rest into an overflow menu.',
    },
  ];
}
