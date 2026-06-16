import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ButtonComponent, DrawerComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-drawer',
  standalone: true,
  imports: [ButtonComponent, DocsSectionComponent, DrawerComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './drawer.section.html',
  styleUrl: './drawer.section.scss',
})
export class DrawerSection {
  protected readonly open = signal(false);
}
