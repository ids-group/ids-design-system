import { Component, ViewEncapsulation } from '@angular/core';
import { ContainerComponent, InlineComponent, StackComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-layout-primitives',
  standalone: true,
  imports: [
    ContainerComponent,
    InlineComponent,
    StackComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './layout-primitives.section.html',
  styleUrls: ['../../../shared/section-demo.scss', '../../../shared/section-demo.responsive.scss'],
})
export class LayoutPrimitivesSection {}
