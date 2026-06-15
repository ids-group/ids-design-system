import { Component, ViewEncapsulation } from '@angular/core';
import { DropzoneComponent, IconComponent } from 'ds';
import { DocsAwaitComponent } from '../../../shared/docs-await.component';

@Component({
  selector: 'section-components-dropzone',
  standalone: true,
  imports: [DocsAwaitComponent, DropzoneComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './dropzone.section.html',
  styleUrl: './dropzone.section.scss',
})
export class DropzoneSection {}
