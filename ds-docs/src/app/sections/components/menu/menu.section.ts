import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import {
  MenuComponent,
  MenuDividerComponent,
  MenuItemComponent,
} from 'ds/menu';
import { DsPopoverTrigger, PopoverComponent } from 'ds/popover';
import { TooltipDirective } from 'ds/tooltip';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-menu',
  standalone: true,
  imports: [
    ButtonComponent,
    MenuComponent,
    MenuDividerComponent,
    MenuItemComponent,
    DsPopoverTrigger,
    PopoverComponent,
    TooltipDirective,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './menu.section.html',
  styleUrl: './menu.section.scss',
})
export class MenuSection {
  protected readonly lastAction = signal('none');
}
