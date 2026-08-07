import { Component, ViewEncapsulation } from '@angular/core';
import { BreadcrumbsComponent, type BreadcrumbItem } from 'ds';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-breadcrumbs',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    DocsTruncationComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './breadcrumbs.section.html',
  styleUrl: './breadcrumbs.section.scss',
})
export class BreadcrumbsSection {
  protected readonly defaultTrail: BreadcrumbItem[] = [
    { label: 'Workspace', href: '/' },
    { label: 'Clients', href: '/clients' },
    { label: 'Acme Co.', href: '/clients/acme' },
    { label: 'P-12894' },
  ];

  /** A genuinely deep trail — the component collapses it, nothing is faked here. */
  protected readonly longTrail: BreadcrumbItem[] = [
    { label: 'Workspace', href: '/' },
    { label: 'Clients', href: '/clients' },
    { label: 'Acme Holdings', href: '/clients/acme' },
    { label: 'Policies', href: '/clients/acme/policies' },
    { label: 'Motor fleet', href: '/clients/acme/policies/motor' },
    { label: 'P-12894' },
  ];

  protected readonly singleLevel: BreadcrumbItem[] = [
    { label: 'Workspace', href: '/' },
    { label: 'Settings' },
  ];
  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Item label',
      behaviour:
        'Single line, ellipsis at long labels. Tooltip on hover when clipped.',
    },
    {
      field: 'Separator',
      behaviour: 'Single glyph (slash or chevron) — no clip.',
    },
    {
      field: 'Current item',
      behaviour: 'Bold; truncates last if overflows total width.',
    },
  ];
}
