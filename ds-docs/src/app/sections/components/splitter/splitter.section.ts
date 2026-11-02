import { Component, ViewEncapsulation, signal } from '@angular/core';
import { SplitterComponent } from 'ds/splitter';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-splitter',
  standalone: true,
  imports: [DocsSectionComponent, SplitterComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './splitter.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './splitter.section.scss'],
})
export class SplitterSection {
  protected readonly previewWidth = signal<number | null>(null);
  protected readonly outputHeight = signal<number | null>(120);
}
