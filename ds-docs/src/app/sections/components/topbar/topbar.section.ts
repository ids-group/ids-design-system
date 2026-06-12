import { Component, ViewEncapsulation } from '@angular/core';
import { AvatarComponent, BreadcrumbsComponent, IconComponent, SearchComponent, TopBarComponent, type BreadcrumbItem } from 'ds';

@Component({
  selector: 'section-components-topbar',
  standalone: true,
  imports: [AvatarComponent, BreadcrumbsComponent, IconComponent, SearchComponent, TopBarComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './topbar.section.html',
  styleUrl: './topbar.section.scss',
})
export class TopbarSection {
  protected readonly trail: BreadcrumbItem[] = [
    { icon: 'home', href: '#' },
    { label: 'Records', href: '#' },
    { label: '2026 Cycle', href: '#' },
    { label: 'Project Alpha' },
  ];
}
