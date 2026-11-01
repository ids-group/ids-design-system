import {
  Component,
  ViewEncapsulation,
  computed,
  contentChildren,
  forwardRef,
} from '@angular/core';
import { TIMELINE } from './timeline.token';
import { TimelineItemComponent } from './timeline-item.component';

@Component({
  selector: 'ds-timeline',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrl: './timeline.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'list',
  },
  providers: [
    {
      provide: TIMELINE,
      useExisting: forwardRef(() => TimelineComponent),
    },
  ],
})
export class TimelineComponent {
  // Descendants, so an item inside a wrapper element or an @for block still counts.
  private readonly items = contentChildren(TimelineItemComponent, {
    descendants: true,
  });

  /** The item that draws no connector below it. */
  readonly lastItem = computed<object | undefined>(() => this.items().at(-1));
}
