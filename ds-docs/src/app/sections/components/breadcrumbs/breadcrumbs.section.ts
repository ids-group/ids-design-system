import { Component, ViewEncapsulation } from '@angular/core';
import { BreadcrumbsComponent } from 'ds/breadcrumbs';
import type { BreadcrumbItem } from 'ds/breadcrumbs';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-breadcrumbs',
  standalone: true,
  imports: [BreadcrumbsComponent, DocsSectionComponent],
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

  protected readonly clippedTrail: BreadcrumbItem[] = [
    { label: 'Workspace', href: '/' },
    { label: 'Quarterly planning and budget review', href: '/planning' },
    { label: 'Summary' },
  ];

  protected readonly singleLevel: BreadcrumbItem[] = [
    { label: 'Workspace', href: '/' },
    { label: 'Settings' },
  ];
}
