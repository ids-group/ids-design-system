import { Component, ViewEncapsulation } from '@angular/core';
import { BreadcrumbsComponent, IconComponent, type BreadcrumbItem } from 'ds';

@Component({
  selector: 'section-components-breadcrumbs',
  standalone: true,
  imports: [BreadcrumbsComponent, IconComponent],
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

  protected readonly longTrail: BreadcrumbItem[] = [
    { label: 'Workspace', href: '/' },
    { label: '…' },
    { label: 'Policies', href: '/clients/acme/policies' },
    { label: 'P-12894' },
  ];

  protected readonly singleLevel: BreadcrumbItem[] = [
    { label: 'Workspace', href: '/' },
    { label: 'Settings' },
  ];
}
