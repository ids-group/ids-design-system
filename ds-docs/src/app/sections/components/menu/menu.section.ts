import { Component, ViewEncapsulation } from '@angular/core';
import {
  ButtonComponent,
  MenuComponent,
  MenuDividerComponent,
  MenuItemComponent,
  PopoverComponent,
} from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-menu',
  standalone: true,
  imports: [
    ButtonComponent,
    MenuComponent,
    MenuDividerComponent,
    MenuItemComponent,
    PopoverComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './menu.section.html',
  styleUrl: './menu.section.scss',
})
export class MenuSection {}
