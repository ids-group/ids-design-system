import { Component, ViewEncapsulation, signal } from '@angular/core';
import {
  ButtonComponent,
  DrawerComponent,
  type DrawerPlacement,
  type DsSize,
} from 'ds';
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
  protected readonly activePlacement = signal<DrawerPlacement>('right');
  protected readonly activeSize = signal<DsSize>('md');

  protected openWith(
    placement: DrawerPlacement,
    size: DsSize = 'md',
  ): void {
    this.activePlacement.set(placement);
    this.activeSize.set(size);
    this.open.set(true);
  }
}
