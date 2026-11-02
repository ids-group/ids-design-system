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
import { CHAT_STEPS } from './chat.token';
import type { ChatStepStatus } from './chat.types';

const STATUS_ICONS: Partial<Record<ChatStepStatus, IconName>> = {
  done: 'check',
  waiting: 'pause',
  error: 'x',
};

const STATUS_WORDING = {
  done: 'stepDone',
  running: 'stepRunning',
  pending: 'stepPending',
  waiting: 'stepWaiting',
  error: 'stepFailed',
} as const;

let nextId = 0;

/**
 * One step of an agent's work inside `ds-chat-steps`: a marker for its `status`, the heading, and
 * optional content under it (such as Approve buttons on a `waiting` step). Slots: `[trailing]` at the
 * end of the heading row (Stop, Retry), `[details]` behind a chevron (the step's log).
 */
@Component({
  selector: 'ds-chat-step',
  standalone: true,
  imports: [IconComponent, SpinnerComponent],
  templateUrl: './chat-step.component.html',
  styleUrl: './chat-step.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'listitem',
    '[attr.data-status]': 'status()',
    '[class.is-first]': 'isFirst()',
    '[class.is-last]': 'isLast()',
    '[class.is-expanded]': 'expanded()',
    '[class.outside-steps]': '!steps',
  },
})
export class ChatStepComponent {
  /** What the step does, such as "Run the build". */
  readonly heading = input<string>('');
  /** Time or duration label under the content. */
  readonly time = input<string>('');
  /** Where the step is: draws the marker and is spoken before the heading. */
  readonly status = input<ChatStepStatus | null>(null);
  /** Whether the `[details]` area is open, two-way bound. */
  readonly expanded = model<boolean>(false);

  private readonly intl = inject(DS_INTL);
  protected readonly steps = inject(CHAT_STEPS, { optional: true });

  protected readonly detailsId = `ds-chat-step-${++nextId}-details`;

  protected readonly isFirst = computed(() => this.steps?.firstStep() === this);

  protected readonly isLast = computed(() => this.steps?.lastStep() === this);

  protected readonly nodeIcon = computed<IconName | null>(() => {
    const status = this.status();

    return status ? (STATUS_ICONS[status] ?? null) : null;
  });

  private readonly wording = computed(() => ({
    ...DS_INTL_DEFAULTS.chat,
    ...this.intl().chat,
  }));

  protected readonly statusLabel = computed(() => {
    const status = this.status();

    return status ? this.wording()[STATUS_WORDING[status]] : '';
  });

  protected readonly detailsLabel = computed(() =>
    this.wording().stepDetails(this.heading()),
  );

  protected toggle(): void {
    this.expanded.set(!this.expanded());
  }
}
