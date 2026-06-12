import { Component, ViewEncapsulation } from '@angular/core';
import { IconComponent, SearchComponent } from 'ds';

@Component({
  selector: 'section-components-search',
  standalone: true,
  imports: [IconComponent, SearchComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './search.section.html',
  styleUrl: './search.section.scss',
})
export class SearchSection {}
