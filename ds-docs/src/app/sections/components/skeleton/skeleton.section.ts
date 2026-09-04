import { Component, ViewEncapsulation } from '@angular/core';
import { SkeletonComponent } from 'ds/skeleton';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-skeleton',
  standalone: true,
  imports: [SkeletonComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './skeleton.section.html',
  styleUrl: './skeleton.section.scss',
})
export class SkeletonSection {}
