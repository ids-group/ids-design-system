import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { BadgeComponent } from 'ds/badge';
import { BreadcrumbsComponent } from 'ds/breadcrumbs';
import type { BreadcrumbItem } from 'ds/breadcrumbs';
import { ButtonComponent } from 'ds/button';
import { PageHeaderComponent } from 'ds/page-header';
import { TabComponent, TabsComponent } from 'ds/tabs';

@Component({
  selector: 'pattern-page-header',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    DocsSectionComponent,
    PageHeaderComponent,
    ButtonComponent,
    BadgeComponent,
    TabsComponent,
    TabComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './page-header.section.html',
  styleUrl: './page-header.section.scss',
})
export class PageHeaderSection {
  protected readonly lede =
    'How a record page composes breadcrumb, title, status, actions and tabs into one header. The component lives under Components.';

  protected readonly crumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/' },
    { label: 'Records', href: '/records' },
    { label: 'Project Alpha' },
  ];
}
