import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { PageFooterComponent } from 'ds/page-footer';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-page-footer',
  standalone: true,
  imports: [ButtonComponent, PageFooterComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './page-footer.section.html',
  styleUrl: './page-footer.section.scss',
})
export class PageFooterSection {}
