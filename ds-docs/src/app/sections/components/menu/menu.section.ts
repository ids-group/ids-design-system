import { Component, ViewEncapsulation } from '@angular/core';
import { MenuComponent, MenuItemComponent } from 'ds';

@Component({
  selector: 'section-components-menu',
  standalone: true,
  imports: [MenuComponent, MenuItemComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './menu.section.html',
  styleUrl: './menu.section.scss',
})
export class MenuSection {}
