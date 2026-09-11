import { Component, ViewEncapsulation } from '@angular/core';
import {
  BrandNameDirective,
  SidenavComponent,
  SidenavGroupComponent,
  SidenavItemComponent,
} from 'ds/sidenav';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-sidenav',
  standalone: true,
  imports: [
    BrandNameDirective,
    SidenavComponent,
    SidenavGroupComponent,
    SidenavItemComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './sidenav.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './sidenav.section.scss'],
})
export class SidenavSection {}
