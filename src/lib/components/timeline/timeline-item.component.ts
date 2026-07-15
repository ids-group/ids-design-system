import { Component, ViewEncapsulation, input } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';

export type TimelineTone =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'muted';

@Component({
  selector: 'ds-timeline-item',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './timeline-item.component.html',
  styleUrl: './timeline-item.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'listitem',
    '[attr.data-tone]': 'tone()',
  },
})
export class TimelineItemComponent {
  /** Primary text for the entry. */
  readonly heading = input<string>('');
  /** Timestamp or date label shown below the content. */
  readonly time = input<string>('');
  /** Icon shown in the marker; omit for a plain dot. */
  readonly icon = input<IconName | null>(null);
  /** Semantic accent color for the marker. */
  readonly tone = input<TimelineTone>('default');
}
