import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, PopoverComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-popover',
  standalone: true,
  imports: [ButtonComponent, PopoverComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './popover.section.html',
  styleUrl: './popover.section.scss',
})
export class PopoverSection {}
