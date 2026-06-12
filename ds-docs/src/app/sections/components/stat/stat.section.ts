import { Component, ViewEncapsulation } from '@angular/core';
import { StatComponent } from 'ds';

@Component({
  selector: 'section-components-stat',
  standalone: true,
  imports: [StatComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './stat.section.html',
  styleUrl: './stat.section.scss',
})
export class StatSection {}
