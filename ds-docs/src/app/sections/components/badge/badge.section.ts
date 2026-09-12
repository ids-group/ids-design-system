import { Component, ViewEncapsulation } from '@angular/core';
import { BadgeComponent } from 'ds/badge';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsSpecimensComponent } from '../../../shared/docs-specimens.component';

@Component({
  selector: 'section-components-badge',
  standalone: true,
  imports: [BadgeComponent, DocsSectionComponent, DocsSpecimensComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './badge.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class BadgeSection {
  protected readonly lifecycleVariants: readonly string[] = [
    'planning',
    'confirmed',
    'active',
    'completed',
  ];
}
