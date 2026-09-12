import { Component, ViewEncapsulation } from '@angular/core';
import { DropzoneComponent } from 'ds/dropzone';
import type { DropzoneFile } from 'ds/dropzone';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-dropzone',
  standalone: true,
  imports: [DocsSectionComponent, DropzoneComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './dropzone.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './dropzone.section.scss'],
})
export class DropzoneSection {
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
    {
      id: 'row-queued',
      name: 'project-brief.pdf',
      size: 2_516_582,
      state: 'queued',
      progress: 0,
    },
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
