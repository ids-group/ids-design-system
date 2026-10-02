import { Component, ViewEncapsulation, signal } from '@angular/core';
import { TagComponent } from 'ds/tag';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-tag',
  standalone: true,
  imports: [DocsSectionComponent, TagComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './tag.section.html',
  styleUrl: './tag.section.scss',
})
export class TagSection {
  protected readonly selectedSites = signal<Set<string>>(new Set(['north']));
  protected readonly closableTags = signal<readonly string[]>(['Project Alpha', 'Site North']);

  protected removeTag(tag: string): void {
    this.closableTags.update((tags) => tags.filter((current) => current !== tag));
  }

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
