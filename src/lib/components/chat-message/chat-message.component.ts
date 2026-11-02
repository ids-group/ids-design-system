import {
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  signal,
  output,
  untracked,
} from '@angular/core';
import {
  DS_INTL,
  DS_INTL_DEFAULTS,
} from '@ids-group-ltd/ids-design-system/core';
import { ButtonComponent } from '@ids-group-ltd/ids-design-system/components/button';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { TimelineItemComponent } from '@ids-group-ltd/ids-design-system/components/timeline';
import { CHAT_THREAD } from './chat.token';
import type { ChatMessageRole, ChatMessageStatus } from './chat.types';

/**
 * One message of a conversation: a bubble on the right for the user, on the left for the
 * assistant. Slots: default (the text or rendered markdown), `[steps]` (a `ds-timeline` of the
 * agent's steps, above the bubble), `[attachments]` (under the text), `[actions]` (under the bubble).
 * With `stepsFolded` the steps fold into a chip at the top of the bubble that opens them again.
 */
@Component({
  selector: 'ds-chat-message',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    // The `role` input would otherwise stay on the host as an invalid ARIA role.
    '[attr.role]': 'null',
    '[attr.data-role]': 'role()',
    '[class.in-thread]': '!!thread',
    '[class.is-first]': 'isFirst()',
    '[class.is-grouped]': 'isGrouped()',
    '[class.is-continued]': 'isContinued()',
    '[class.has-divider]': '!!timeBreak()',
    '[attr.data-status]': 'status()',
    '[attr.aria-busy]': 'streaming() || null',
  },
})
export class ChatMessageComponent {
  /** Who wrote it: `'user'` draws a filled bubble on the right, `'assistant'` a subtle one on the left. */
  readonly role = input<ChatMessageRole>('assistant');
  /** Name shown above the bubble. Without it the role is spoken (`DS_INTL.chat.user` / `assistant`). */
  readonly author = input<string>('');
  /** Time label shown above the bubble, already formatted. */
  readonly time = input<string>('');
  /** When it was sent. Inside a `ds-chat-thread` it splits a run by time and dates the divider. */
  readonly sentAt = input<Date | string | number | null>(null);
  /** The text is still arriving: a caret blinks after it and `[actions]` stay hidden until it is done. */
  readonly streaming = input(false, { transform: booleanAttribute });
  /** Delivery of a message the reader sent: `'sending'` dims it, `'sent'` marks it, `'failed'` says it
   *  was not sent and offers Retry. `null` shows nothing. */
  readonly status = input<ChatMessageStatus | null>(null);

  /** The `[steps]` fold into a chip at the top of the bubble, which opens them again; two-way bound.
   *  Inside a `ds-chat-thread` the steps of the reply before a new user message fold on their own
   *  (`foldStepsOnSend`). Folds only steps given as `ds-timeline-item`s. */
  readonly stepsFolded = model<boolean>(false);

  /** Retry was pressed on a `'failed'` message. Send it again and move `status` back to `'sending'`. */
  readonly retry = output<void>();

  private readonly steps = contentChildren(TimelineItemComponent, {
    descendants: true,
  });
  private readonly stepElements = contentChildren(TimelineItemComponent, {
    descendants: true,
    read: ElementRef<HTMLElement>,
  });
  /** How many `ds-timeline-item`s the `[steps]` hold. @internal */
  readonly stepCount = computed(() => this.steps().length);
  /** How many of them have `status="error"`. @internal */
  readonly failedStepCount = computed(
    () => this.steps().filter((step) => step.status() === 'error').length,
  );
  private readonly openedFailures = new Set<TimelineItemComponent>();
  private readonly openedFailuresVersion = signal(0);
  /** Failed steps the reader has not opened yet; while any remain the thread does not fold them.
   *  @internal */
  readonly unopenedFailedStepCount = computed(() => {
    this.openedFailuresVersion();

    return this.steps().filter(
      (step) => step.status() === 'error' && !this.openedFailures.has(step),
    ).length;
  });
  protected readonly folded = computed(
    () => this.stepsFolded() && this.stepCount() > 0,
  );

  private readonly intl = inject(DS_INTL);
  protected readonly thread = inject(CHAT_THREAD, { optional: true });

  protected readonly isFirst = computed(
    () => this.thread?.firstMessage() === this,
  );
  protected readonly isGrouped = computed(
    () => this.thread?.groupedMessages().has(this) ?? false,
  );

  protected readonly isContinued = computed(
    () => this.thread?.continuedMessages().has(this) ?? false,
  );

  protected readonly timeBreak = computed(
    () => this.thread?.timeBreaks().get(this) ?? '',
  );

  /** `sentAt` in milliseconds, or `null` when unset or unreadable. */
  readonly sentAtMs = computed(() => {
    const value = this.sentAt();
    const ms = value === null ? Number.NaN : new Date(value).getTime();

    return Number.isNaN(ms) ? null : ms;
  });

  protected readonly wording = computed(() => ({
    ...DS_INTL_DEFAULTS.chat,
    ...this.intl().chat,
  }));

  protected readonly speaker = computed(
    () => this.author() || this.wording()[this.role()],
  );

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // The fold is applied here rather than through a template binding, so it can animate from the
    // current boxes. The first state is applied without motion.
    let rendered = false;
    afterNextRender(() => {
      rendered = true;
      this.applyFold(this.folded(), false);
      if (this.thread?.live()) {
        this.growIn([this.host.nativeElement]);
      }
    });
    effect(() => {
      const folded = this.folded();
      untracked(() => {
        if (rendered) {
          this.applyFold(folded, true);
        }
      });
    });
    // Opening a failed step's details counts as the reader having seen it.
    effect(() => {
      for (const step of this.steps()) {
        if (
          step.status() === 'error' &&
          step.expanded() &&
          !this.openedFailures.has(step)
        ) {
          this.openedFailures.add(step);
          untracked(() =>
            this.openedFailuresVersion.update((version) => version + 1),
          );
        }
      }
    });
    // Steps that arrive into a message already on screen grow in, one after another.
    let knownSteps = new Set<TimelineItemComponent>();
    effect(() => {
      const items = this.steps();
      untracked(() => {
        const added = items.filter((item) => !knownSteps.has(item));
        knownSteps = new Set(items);
        if (rendered && added.length) {
          afterNextRender(
            () => {
              const elements = this.stepElements();
              this.growIn(
                added.map(
                  (item) => elements[items.indexOf(item)].nativeElement,
                ),
              );
            },
            { injector: this.injector },
          );
        }
      });
    });
  }

  private readonly injector = inject(Injector);

  protected toggleSteps(): void {
    this.stepsFolded.set(!this.stepsFolded());
  }

  private motion(): boolean {
    const host = this.host.nativeElement;

    return (
      typeof matchMedia === 'function' &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches &&
      typeof host.animate === 'function'
    );
  }

  // Height, not a transform, so the thread's layout follows every frame and a pinned thread keeps
  // its bottom still.
  private growIn(elements: readonly HTMLElement[]): void {
    if (!this.motion()) {
      return;
    }
    elements.forEach((element, index) => {
      const height = element.getBoundingClientRect().height;
      element.animate(
        [
          {
            height: '0px',
            opacity: 0,
            transform: 'translateY(-4px)',
            overflow: 'hidden',
          },
          {
            height: `${height}px`,
            opacity: 1,
            transform: 'none',
            overflow: 'hidden',
          },
        ],
        {
          duration: 200,
          delay: index * 60,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          fill: 'backwards',
        },
      );
    });
  }

  // Folding, the steps shrink toward the chip as the chip grows at the top of the bubble; opening,
  // the steps grow back above it. Both run on height, so the bubble and its text move with the
  // layout rather than jumping. The chip stays once shown, to fold the steps again.
  private applyFold(folded: boolean, animate: boolean): void {
    const host = this.host.nativeElement;
    if (host.classList.contains('steps-folded') === folded) {
      return;
    }
    const steps = host.querySelector<HTMLElement>(':scope > .steps');
    const chip = host.querySelector<HTMLElement>(
      ':scope > .bubble > .steps-chip',
    );
    const chipNew = folded && !host.classList.contains('steps-chip-shown');
    host.classList.add('steps-chip-shown');
    if (!animate || !this.motion() || !steps) {
      host.classList.toggle('steps-folded', folded);

      return;
    }
    const timing: KeyframeAnimationOptions = {
      duration: 380,
      easing: 'cubic-bezier(0.34, 1.25, 0.64, 1)',
    };
    if (chip && chipNew) {
      const chipHeight = chip.getBoundingClientRect().height;
      chip.animate(
        [
          {
            height: '0px',
            opacity: 0,
            transform: 'scale(0.9)',
            overflow: 'hidden',
          },
          {
            height: `${chipHeight}px`,
            opacity: 1,
            transform: 'none',
            overflow: 'hidden',
          },
        ],
        { ...timing, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      );
    }
    if (folded) {
      const height = steps.getBoundingClientRect().height;
      steps.style.transformOrigin = 'bottom left';
      steps.animate(
        [
          {
            height: `${height}px`,
            opacity: 1,
            transform: 'none',
            overflow: 'hidden',
          },
          {
            height: '0px',
            opacity: 0,
            transform: 'scale(0.6)',
            overflow: 'hidden',
          },
        ],
        { duration: 380, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      ).onfinish = () => host.classList.toggle('steps-folded', this.folded());
    } else {
      host.classList.remove('steps-folded');
      const height = steps.getBoundingClientRect().height;
      steps.style.transformOrigin = 'bottom left';
      steps.animate(
        [
          {
            height: '0px',
            opacity: 0,
            transform: 'scale(0.6)',
            overflow: 'hidden',
          },
          {
            height: `${height}px`,
            opacity: 1,
            transform: 'none',
            overflow: 'hidden',
          },
        ],
        timing,
      );
    }
  }
}
