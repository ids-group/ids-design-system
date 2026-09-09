import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { LoadingOverlayComponent } from 'ds/loading-overlay';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-loading-overlay',
  standalone: true,
  imports: [LoadingOverlayComponent, ButtonComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './loading-overlay.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    './loading-overlay.section.scss',
  ],
})
export class LoadingOverlaySection {
  protected readonly busy = signal(true);

  toggle(): void {
    this.busy.set(!this.busy());
  }
}
