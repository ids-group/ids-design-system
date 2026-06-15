import { Component, ViewEncapsulation } from '@angular/core';
import { DatePickerComponent, IconComponent } from 'ds';
import { DocsAwaitComponent } from '../../../shared/docs-await.component';

@Component({
  selector: 'section-components-date-picker',
  standalone: true,
  imports: [DatePickerComponent, DocsAwaitComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './date-picker.section.html',
  styleUrl: './date-picker.section.scss',
})
export class DatePickerSection {}
