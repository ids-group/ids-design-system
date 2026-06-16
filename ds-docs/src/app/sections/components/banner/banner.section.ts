import { Component, ViewEncapsulation } from '@angular/core';
import { BannerComponent, ButtonComponent } from 'ds';
import { DocsTruncationComponent, TruncationRule } from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-banner',
  standalone: true,
  imports: [BannerComponent, ButtonComponent, DocsTruncationComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './banner.section.html',
  styleUrl: './banner.section.scss',
})
export class BannerSection {
  protected readonly truncationRules: TruncationRule[] = [
    { field: 'Title', behaviour: 'Single line, ellipsis at row width. Tooltip on hover when clipped.' },
    { field: 'Body', behaviour: 'Wrap, no clip. No clamp — banners are page-level and must stay fully readable.' },
    { field: 'Inline link in body', behaviour: 'Wraps with the body text. Underlined; never clipped.' },
    { field: 'Dismiss icon', behaviour: 'Always visible. Never overlapped by title or body — body min-width: 0 keeps wrap correct.' },
  ];
}
