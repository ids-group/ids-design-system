import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, PopoverComponent } from 'ds';

@Component({
  selector: 'section-components-popover',
  standalone: true,
  imports: [ButtonComponent, PopoverComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './popover.section.html',
  styleUrl: './popover.section.scss',
})
export class PopoverSection {}
