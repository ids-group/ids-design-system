import { Component, ViewEncapsulation, signal } from '@angular/core';
import { IconButtonComponent } from 'ds';

@Component({
  selector: 'section-components-icon-button',
  standalone: true,
  imports: [IconButtonComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './icon-button.section.html',
  styleUrl: './icon-button.section.scss',
})
export class IconButtonSection {
  protected readonly bookmarked = signal(true);
}
