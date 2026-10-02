import { Component, ViewEncapsulation, signal } from '@angular/core';
import { BannerComponent } from 'ds/banner';
import { ButtonComponent } from 'ds/button';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-banner',
  standalone: true,
  imports: [BannerComponent, ButtonComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './banner.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './banner.section.scss'],
})
export class BannerSection {
  protected readonly dismissed = signal<ReadonlySet<string>>(new Set());

  protected dismiss(key: string): void {
    this.dismissed.update((keys) => new Set(keys).add(key));
  }

  protected restore(key: string): void {
    this.dismissed.update((keys) => {
      const next = new Set(keys);
      next.delete(key);

      return next;
    });
  }
}
