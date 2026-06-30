import { Component, ViewEncapsulation } from '@angular/core';
import {
  AvatarComponent,
  BreadcrumbsComponent,
  IconButtonComponent,
  SearchComponent,
  TopBarComponent,
  type BreadcrumbItem,
} from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-topbar',
  standalone: true,
  imports: [
    AvatarComponent,
    BreadcrumbsComponent,
    DocsSectionComponent,
    DocsTruncationComponent,
    IconButtonComponent,
    SearchComponent,
    TopBarComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './topbar.section.html',
  styleUrl: './topbar.section.scss',
})
export class TopbarSection {
  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'App / account label',
      behaviour:
        'Single line, ellipsis at ~20 ch. Tooltip on hover when clipped.',
    },
    {
      field: 'Search input',
      behaviour:
        'Single line, no clip while focused. Placeholder ellipses if the bar shrinks.',
    },
    {
      field: 'Breadcrumb segments',
      behaviour:
        'Middle segments collapse to … before the leaf clips. Leaf truncates last with a tooltip.',
    },
    {
      field: 'Action icons',
      behaviour:
        'No visible label — full label lives in aria-label and tooltip-on-hover.',
    },
  ];

  protected readonly trail: BreadcrumbItem[] = [
    { icon: 'home', href: '#' },
    { label: 'Records', href: '#' },
    { label: '2026 Cycle', href: '#' },
    { label: 'Project Alpha' },
  ];
}
