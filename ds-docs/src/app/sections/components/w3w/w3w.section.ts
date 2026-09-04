import { Component, ViewEncapsulation } from '@angular/core';
import { W3wComponent } from 'ds/w3w';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-w3w',
  standalone: true,
  imports: [DocsSectionComponent, W3wComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './w3w.section.html',
  styleUrl: './w3w.section.scss',
})
export class W3wSection {}
