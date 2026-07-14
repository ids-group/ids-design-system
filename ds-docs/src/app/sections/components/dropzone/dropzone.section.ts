import { Component, ViewEncapsulation } from '@angular/core';
import { DropzoneComponent, type DropzoneFile } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-dropzone',
  standalone: true,
  imports: [
    DocsSectionComponent,
    DocsTruncationComponent,
    DropzoneComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './dropzone.section.html',
  styleUrls: ['./dropzone.section.scss', './dropzone.responsive.scss'],
})
export class DropzoneSection {
  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'File name',
      behaviour: 'Single line, ellipsis. Tooltip on hover with full name.',
    },
    { field: 'Progress percentage', behaviour: 'Numeric — no clip.' },
    {
      field: 'Error message',
      behaviour: 'Wrap, no clip — must remain visible.',
    },
  ];

  protected readonly withFilesDemo: DropzoneFile[] = [
    {
      id: 'wf-1',
      name: 'project-alpha-brief-v3.pdf',
      size: 2_516_582,
      state: 'uploading',
      progress: 65,
      message: 'uploading 65%',
    },
    {
      id: 'wf-2',
      name: 'site-map.dwg',
      size: 8_493_466,
      state: 'success',
      progress: 100,
      message: 'uploaded',
    },
    {
      id: 'wf-3',
      name: 'vendor-list-FINAL.xlsx',
      size: 13_002_342,
      state: 'error',
      progress: 0,
      message: 'exceeds 10 MB limit',
    },
  ];

  protected readonly rowQueued: DropzoneFile[] = [
    { id: 'row-queued', name: 'project-brief.pdf', size: 2_516_582, state: 'queued', progress: 0 },
  ];
  protected readonly rowUploading: DropzoneFile[] = [
    {
      id: 'row-uploading',
      name: 'site-survey.dwg',
      size: 8_493_466,
      state: 'uploading',
      progress: 42,
      message: '42%',
    },
  ];
  protected readonly rowSuccess: DropzoneFile[] = [
    {
      id: 'row-success',
      name: 'risk-assessment.docx',
      size: 1_258_291,
      state: 'success',
      progress: 100,
      message: 'uploaded',
    },
  ];
  protected readonly rowError: DropzoneFile[] = [
    {
      id: 'row-error',
      name: 'vendor-list-FINAL.xlsx',
      size: 13_002_342,
      state: 'error',
      progress: 0,
      message: 'Upload failed — exceeds 10 MB limit',
    },
  ];
}
