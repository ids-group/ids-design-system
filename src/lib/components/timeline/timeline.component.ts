import {
  Component,
  ViewEncapsulation,
  computed,
  contentChildren,
  forwardRef,
  input,
} from '@angular/core';
import { TIMELINE, type TimelineDensity } from './timeline.token';
import { TimelineItemComponent } from './timeline-item.component';

@Component({
  selector: 'ds-timeline',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrl: './timeline.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'list',
    '[attr.data-density]': 'density()',
  },
  providers: [
    {
      provide: TIMELINE,
      useExisting: forwardRef(() => TimelineComponent),
    },
  ],
})
export class TimelineComponent {
  /** `'compact'` sets small markers, smaller text and tight rows with no connector, for the steps
   *  of an agent beside a chat message. */
  readonly density = input<TimelineDensity>('default');

  // Descendants, so an item inside a wrapper element or an @for block still counts.
  private readonly items = contentChildren(TimelineItemComponent, {
    descendants: true,
  });

  /** The item that draws no connector above it. */
  readonly firstItem = computed<object | undefined>(() => this.items().at(0));

  /** The item that draws no connector below it. */
  readonly lastItem = computed<object | undefined>(() => this.items().at(-1));
}
