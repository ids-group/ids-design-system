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
  readonly heading = input<string>('');
  readonly time = input<string>('');
  readonly icon = input<IconName | null>(null);
  readonly tone = input<TimelineTone>('default');
}
