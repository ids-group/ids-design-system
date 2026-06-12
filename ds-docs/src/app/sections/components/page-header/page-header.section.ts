import { Component, ViewEncapsulation } from '@angular/core';
import { BadgeComponent, BreadcrumbsComponent, ButtonComponent, IconComponent, PageHeaderComponent, TabsComponent, TabComponent, type BreadcrumbItem } from 'ds';

@Component({
  selector: 'section-components-page-header',
  standalone: true,
  imports: [BadgeComponent, BreadcrumbsComponent, ButtonComponent, IconComponent, PageHeaderComponent, TabsComponent, TabComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './page-header.section.html',
  styleUrl: './page-header.section.scss',
})
export class PageHeaderSection {
  protected readonly trail: BreadcrumbItem[] = [
    { icon: 'home', href: '#' },
    { label: 'Records', href: '#' },
    { label: '2026 Cycle', href: '#' },
    { label: 'Project Alpha' },
  ];
}
