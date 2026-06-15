import { Component, ViewEncapsulation } from '@angular/core';
import { BadgeComponent } from 'ds';

@Component({
  selector: 'section-home',
  standalone: true,
  imports: [BadgeComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './home.section.html',
  styleUrl: './home.section.scss',
})
export class HomeSection {}
