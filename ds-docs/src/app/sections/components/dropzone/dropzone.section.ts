import { Component, ViewEncapsulation } from '@angular/core';
import { DropzoneComponent, IconComponent } from 'ds';

@Component({
  selector: 'section-components-dropzone',
  standalone: true,
  imports: [DropzoneComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './dropzone.section.html',
  styleUrl: './dropzone.section.scss',
})
export class DropzoneSection {}
