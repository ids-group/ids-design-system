import { Component, ViewEncapsulation } from '@angular/core';
import { SkeletonComponent } from 'ds';

@Component({
  selector: 'section-components-skeleton',
  standalone: true,
  imports: [SkeletonComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './skeleton.section.html',
  styleUrl: './skeleton.section.scss',
})
export class SkeletonSection {}
