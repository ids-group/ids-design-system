import { Component, ViewEncapsulation, signal } from '@angular/core';
import { TagComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-tag',
  standalone: true,
  imports: [DocsSectionComponent, DocsTruncationComponent, TagComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './tag.section.html',
  styleUrl: './tag.section.scss',
})
export class TagSection {
  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Label',
      behaviour:
        'Single line, ellipsis at ~16 ch. Tooltip on hover when clipped.',
    },
  ];

  protected readonly selectedSites = signal<Set<string>>(new Set(['north']));

  protected isSelected(site: string): boolean {
    return this.selectedSites().has(site);
  }

  protected toggle(site: string): void {
    const current = new Set(this.selectedSites());
    if (current.has(site)) {
      current.delete(site);
    } else {
      current.add(site);
    }
    this.selectedSites.set(current);
  }
}
