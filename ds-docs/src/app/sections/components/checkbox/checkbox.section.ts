import { Component, ViewEncapsulation } from '@angular/core';
import { CheckboxComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsComponentMetaComponent, DocsApiTableComponent } from '../../../shared';

@Component({
  selector: 'section-components-checkbox',
  standalone: true,
  imports: [
    CheckboxComponent,
    DocsSectionComponent,
    DocsComponentMetaComponent,
    DocsApiTableComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './checkbox.section.html',
  styleUrl: './checkbox.section.scss',
})
export class CheckboxSection {}
