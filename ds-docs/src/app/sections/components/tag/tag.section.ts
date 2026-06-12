import { Component, ViewEncapsulation } from '@angular/core';
import { TagComponent } from 'ds';

@Component({
  selector: 'section-components-tag',
  standalone: true,
  imports: [TagComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './tag.section.html',
  styleUrl: './tag.section.scss',
})
export class TagSection {
  protected toggle(_site: string): void {
    // demo-only: real consumers flip their own selected state
  }
}
