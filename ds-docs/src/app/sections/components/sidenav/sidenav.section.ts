import { Component, ViewEncapsulation } from '@angular/core';
import { IconComponent, SidenavComponent, SidenavGroupComponent, SidenavItemComponent } from 'ds';

@Component({
  selector: 'section-components-sidenav',
  standalone: true,
  imports: [IconComponent, SidenavComponent, SidenavGroupComponent, SidenavItemComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './sidenav.section.html',
  styleUrl: './sidenav.section.scss',
})
export class SidenavSection {}
