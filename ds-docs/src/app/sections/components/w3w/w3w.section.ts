import { Component, ViewEncapsulation } from '@angular/core';
import { W3wComponent } from 'ds';

@Component({
  selector: 'section-components-w3w',
  standalone: true,
  imports: [W3wComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './w3w.section.html',
  styleUrl: './w3w.section.scss',
})
export class W3wSection {}
