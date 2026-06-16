import { Component, ViewEncapsulation } from '@angular/core';
import { MenuComponent, MenuItemComponent, PopoverComponent } from 'ds';

@Component({
  selector: 'section-components-menu',
  standalone: true,
  imports: [MenuComponent, MenuItemComponent, PopoverComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './menu.section.html',
  styleUrl: './menu.section.scss',
})
export class MenuSection {}
