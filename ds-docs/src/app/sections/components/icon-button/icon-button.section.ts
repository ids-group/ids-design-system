import { Component, ViewEncapsulation, signal } from '@angular/core';
import { IconButtonComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-icon-button',
  standalone: true,
  imports: [DocsSectionComponent, IconButtonComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './icon-button.section.html',
  styleUrl: './icon-button.section.scss',
})
export class IconButtonSection {
  protected readonly bookmarked = signal(true);
}
