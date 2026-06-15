import { Component, ViewEncapsulation } from '@angular/core';
import { CheckboxComponent, RadioComponent, SwitchComponent } from 'ds';
import { DocsAwaitComponent } from '../../../shared/docs-await.component';

@Component({
  selector: 'section-components-selection',
  standalone: true,
  imports: [CheckboxComponent, DocsAwaitComponent, RadioComponent, SwitchComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './selection.section.html',
  styleUrl: './selection.section.scss',
})
export class SelectionSection {}
