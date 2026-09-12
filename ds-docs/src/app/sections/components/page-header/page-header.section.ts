import { Component, ViewEncapsulation } from '@angular/core';
import { BadgeComponent } from 'ds/badge';
import { BreadcrumbsComponent } from 'ds/breadcrumbs';
import type { BreadcrumbItem } from 'ds/breadcrumbs';
import { ButtonComponent } from 'ds/button';
import { PageHeaderComponent } from 'ds/page-header';
import { TabComponent, TabsComponent } from 'ds/tabs';
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
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './page-header.section.html',
  styleUrl: './page-header.section.scss',
})
export class PageHeaderSection {
  protected readonly trail: BreadcrumbItem[] = [
    { icon: 'home', href: '#', ariaLabel: 'Home' },
    { label: 'Records', href: '#' },
    { label: '2026 Cycle', href: '#' },
    { label: 'Project Alpha' },
  ];
}
