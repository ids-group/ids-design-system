import { Component, ViewEncapsulation } from '@angular/core';
import { DropzoneComponent, IconComponent } from 'ds';
import { DocsAwaitComponent } from '../../../shared/docs-await.component';
import { DocsTruncationComponent, TruncationRule } from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-dropzone',
  standalone: true,
  imports: [DocsAwaitComponent, DocsTruncationComponent, DropzoneComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './dropzone.section.html',
  styleUrl: './dropzone.section.scss',
})
export class DropzoneSection {
  protected readonly truncationRules: TruncationRule[] = [
    { field: 'File name', behaviour: 'Single line, ellipsis. Tooltip on hover with full name.' },
    { field: 'Progress percentage', behaviour: 'Numeric — no clip.' },
    { field: 'Error message', behaviour: 'Wrap, no clip — must remain visible.' },
  ];
}
