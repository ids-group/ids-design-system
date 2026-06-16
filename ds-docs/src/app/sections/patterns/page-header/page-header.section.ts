import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  BreadcrumbsComponent,
  PageHeaderComponent,
  ButtonComponent,
  BadgeComponent,
  TabsComponent,
  TabComponent,
  type BreadcrumbItem,
} from 'ds';

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
    'How a record page assembles breadcrumb, title, status, primary actions and tabs into a single header. The component itself lives under Components — this pattern documents how to compose it.';

  protected readonly crumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/' },
    { label: 'Records', href: '/records' },
    { label: 'Project Alpha' },
  ];
}
