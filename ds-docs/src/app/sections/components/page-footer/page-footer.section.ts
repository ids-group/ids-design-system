import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, PageFooterComponent } from 'ds';

@Component({
  selector: 'section-components-page-footer',
  standalone: true,
  imports: [ButtonComponent, PageFooterComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './page-footer.section.html',
  styleUrl: './page-footer.section.scss',
})
export class PageFooterSection {}
