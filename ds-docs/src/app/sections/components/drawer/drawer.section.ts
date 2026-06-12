import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ButtonComponent, DrawerComponent } from 'ds';

@Component({
  selector: 'section-components-drawer',
  standalone: true,
  imports: [ButtonComponent, DrawerComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './drawer.section.html',
  styleUrl: './drawer.section.scss',
})
export class DrawerSection {
  protected readonly open = signal(false);
}
