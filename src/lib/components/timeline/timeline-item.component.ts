import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { SpinnerComponent } from '@ids-group-ltd/ids-design-system/components/spinner';
import {
  DS_INTL,
  DS_INTL_DEFAULTS,
  type IconName,
} from '@ids-group-ltd/ids-design-system/core';
import { TIMELINE } from './timeline.token';

export type TimelineTone =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'muted';

export type TimelineStatus = 'done' | 'running' | 'pending' | 'error';

const STATUS_ICONS: Partial<Record<TimelineStatus, IconName>> = {
  done: 'check',
  error: 'x',
};

let nextId = 0;

@Component({
  selector: 'ds-timeline-item',
  standalone: true,
  imports: [IconComponent, SpinnerComponent],
  templateUrl: './timeline-item.component.html',
  styleUrl: './timeline-item.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'listitem',
    '[attr.data-tone]': 'tone()',
    '[attr.data-status]': 'status()',
    '[class.is-first]': 'isFirst()',
    '[class.is-last]': 'isLast()',
    '[class.is-expanded]': 'expanded()',
    '[class.is-compact]': 'compact()',
    '[class.outside-timeline]': '!timeline',
  },
})
export class TimelineItemComponent {
  /** Primary text for the entry. */
  readonly heading = input<string>('');
  /** Timestamp or date label below the content. */
  readonly time = input<string>('');
  /** Marker icon; omit for a plain dot. Ignored while `status` is set. */
  readonly icon = input<IconName | null>(null);
  /** Semantic accent color for the marker. Ignored while `status` is set. */
  readonly tone = input<TimelineTone>('default');
  /** Step state: draws the marker and is spoken before the heading. `null` leaves `icon` and `tone` in charge. */
  readonly status = input<TimelineStatus | null>(null);
  /** Whether the `[details]` area is open, two-way bound. */
  readonly expanded = model<boolean>(false);

  private readonly intl = inject(DS_INTL);
  protected readonly timeline = inject(TIMELINE, { optional: true });

  protected readonly detailsId = `ds-timeline-item-${++nextId}-details`;

  protected readonly compact = computed(
    () => this.timeline?.density() === 'compact',
  );

  protected readonly isFirst = computed(
    () => this.timeline?.firstItem() === this,
  );

  protected readonly isLast = computed(
    () => this.timeline?.lastItem() === this,
  );

  protected readonly nodeIcon = computed<IconName | null>(() => {
    const status = this.status();

    return status ? (STATUS_ICONS[status] ?? null) : this.icon();
  });

  private readonly wording = computed(() => ({
    ...DS_INTL_DEFAULTS.timeline,
    ...this.intl().timeline,
  }));

  protected readonly statusLabel = computed(() => {
    const status = this.status();

    return status ? this.wording()[status] : '';
  });

  protected readonly detailsLabel = computed(() =>
    this.wording().details(this.heading()),
  );

  protected toggle(): void {
    this.expanded.set(!this.expanded());
  }
}
