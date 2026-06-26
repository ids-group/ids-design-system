import { Component, ViewEncapsulation, signal } from '@angular/core';
import { LoadingOverlayComponent, ButtonComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-loading-overlay',
  standalone: true,
  imports: [LoadingOverlayComponent, ButtonComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './loading-overlay.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class LoadingOverlaySection {
  protected readonly busy = signal(true);

  toggle(): void {
    this.busy.set(!this.busy());
  }
}
