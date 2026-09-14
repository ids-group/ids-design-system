import { Component, ViewEncapsulation } from '@angular/core';
import { AvatarComponent } from 'ds/avatar';
import { BreadcrumbsComponent } from 'ds/breadcrumbs';
import type { BreadcrumbItem } from 'ds/breadcrumbs';
import { IconButtonComponent } from 'ds/icon-button';
import { SearchComponent } from 'ds/search';
import { TopBarComponent } from 'ds/topbar';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-topbar',
  standalone: true,
  imports: [
    AvatarComponent,
    BreadcrumbsComponent,
    DocsSectionComponent,
    IconButtonComponent,
    SearchComponent,
    TopBarComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './topbar.section.html',
  styleUrl: './topbar.section.scss',
})
export class TopbarSection {
  protected readonly trail: BreadcrumbItem[] = [
    { icon: 'home', href: '#', ariaLabel: 'Home' },
    { label: 'Records', href: '#' },
    { label: '2026 Cycle', href: '#' },
    { label: 'Project Alpha' },
  ];
}
