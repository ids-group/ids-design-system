import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

/** @internal Never rendered: creating it once registers the page-wide drag rules globally. */
@Component({
  standalone: true,
  template: '',
  styleUrl: './splitter-dragging.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitterDraggingStylesComponent {}
