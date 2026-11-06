import {
  Component,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
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
  type IconName,
} from '@ids-group-ltd/ids-design-system/core';
import { ButtonComponent } from '@ids-group-ltd/ids-design-system/components/button';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { CHAT_THREAD } from './chat.token';
import { ChatStepComponent } from './chat-step.component';
import { ChatStepsComponent } from './chat-steps.component';
import type {
  ChatMessageRole,
  ChatMessageStatus,
  ChatMessageTone,
} from './chat.types';

const TONE_ICONS: Record<ChatMessageTone, IconName | null> = {
  neutral: null,
  info: 'info',
  success: 'success',
  warning: 'warn',
  error: 'error',
};

/**
 * One message of a conversation: a bubble on the right for the user, on the left for the
 * assistant. Slots: default (the text or rendered markdown), `[steps]` (a `ds-chat-steps` of the
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
    '[attr.title]': 'null',
    '[attr.data-role]': 'role()',
    '[attr.data-tone]': "role() === 'system' ? tone() : null",
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
  /** What a `'system'` notice means. `'neutral'` is a quiet one-line plaque for a routine note
   *  (saved, switched, started); `'info'`, `'success'`, `'warning'` and `'error'` draw a card in that
   *  status colour with its icon, for a note the reader should not miss. Other roles ignore it. */
  readonly tone = input<ChatMessageTone>('neutral');
  /** A bold first line of a `'system'` notice, for one that carries a detail under it. */
  readonly title = input<string>('');
  /** Icon at the start of a `'system'` notice. A toned notice shows its tone's icon without it; a
   *  `'neutral'` one shows none. */
  readonly icon = input<IconName | null>(null);
  /** Name shown above the bubble. Without it the role is spoken (`DS_INTL.chat.user` / `assistant`). */
  readonly author = input<string>('');
  /** Time label, already formatted, shown under the bubble. In a `ds-chat-thread` only the last message
   *  of a run shows it. */
  readonly time = input<string>('');
  /** When it was sent. Inside a `ds-chat-thread` it splits a run by time and dates the divider. */
  readonly sentAt = input<Date | string | number | null>(null);
  /** The text is still arriving: a caret blinks after it and `[actions]` stay hidden until it is done. */
  readonly streaming = input(false, { transform: booleanAttribute });
  /** Delivery of a message the reader sent: `'sending'` dims it and `'failed'` says it was not sent and
   *  offers Retry, both in place of `time`. `'sent'` shows nothing and is only spoken. */
  readonly status = input<ChatMessageStatus | null>(null);

  /** The `[steps]` fold into a chip at the top of the bubble, which opens them again; two-way bound.
   *  Inside a `ds-chat-thread` the steps of the reply before a new user message fold on their own
   *  (`foldStepsOnSend`). Folds only steps given as `ds-chat-step`s. */
  readonly stepsFolded = model<boolean>(false);

  /** Retry was pressed on a `'failed'` message. Send it again and move `status` back to `'sending'`. */
  readonly retry = output<void>();

  private readonly stepList = contentChild(ChatStepsComponent, {
    descendants: true,
  });
  private readonly steps = contentChildren(ChatStepComponent, {
    descendants: true,
  });
  private readonly stepElements = contentChildren(ChatStepComponent, {
    descendants: true,
    read: ElementRef<HTMLElement>,
  });
  /** How many `ds-chat-step`s the `[steps]` hold. @internal */
  readonly stepCount = computed(() => this.steps().length);
  /** How many of them have `status="error"`. @internal */
  readonly failedStepCount = computed(
    () => this.steps().filter((step) => step.status() === 'error').length,
  );
  private readonly openedFailures = new Set<ChatStepComponent>();
  private readonly openedFailuresVersion = signal(0);
  /** Failed steps the reader has not opened yet; while any remain the thread does not fold them.
   *  @internal */
  readonly unopenedFailedStepCount = computed(() => {
    this.openedFailuresVersion();

    return this.steps().filter(
      (step) => step.status() === 'error' && !this.openedFailures.has(step),
    ).length;
  });
  private readonly stagger = computed(
    () => this.stepList()?.enter() === 'stagger',
  );
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

  protected readonly noticeIcon = computed(
    () => this.icon() ?? TONE_ICONS[this.tone()],
  );

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
      if (this.thread?.appendedAfterRender(this)) {
        const steps = this.stepElements().map((step) => step.nativeElement);
        // A plan given at once: the steps grow in one after another, or the message as one block.
        if (this.stagger() && steps.length) {
          this.growIn(steps, 70);
        } else {
          this.growIn([this.host.nativeElement]);
        }
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
    // A step that fails while folded opens the steps again, so a failure is never hidden.
    effect(() => {
      if (this.stepsFolded() && this.unopenedFailedStepCount() > 0) {
        untracked(() => this.stepsFolded.set(false));
      }
    });
    // Steps that arrive into a message already on screen grow in, one after another.
    let knownSteps = new Set<ChatStepComponent>();
    effect(() => {
      const items = this.steps();
      untracked(() => {
        const added = items.filter((item) => !knownSteps.has(item));
        knownSteps = new Set(items);
        // Started here, before the frame paints, so a step never shows at full height first.
        if (rendered && added.length) {
          const elements = this.stepElements();
          this.growIn(
            added.map((item) => elements[items.indexOf(item)].nativeElement),
            this.stagger() ? 70 : 0,
          );
        }
      });
    });
  }

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
  private growIn(elements: readonly HTMLElement[], stagger = 0): void {
    if (!this.motion()) {
      return;
    }
    // To `auto` (interpolate-size), so nothing is measured and it can start before the first paint.
    elements.forEach((element, index) => {
      element.animate(
        [
          {
            height: '0px',
            opacity: 0,
            transform: 'translateY(-4px)',
            overflow: 'hidden',
          },
          {
            height: 'auto',
            opacity: 1,
            transform: 'none',
            overflow: 'hidden',
          },
        ],
        {
          duration: 200,
          delay: index * stagger,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          fill: 'backwards',
        },
      );
    });
  }

  // Folding is a container transform: the steps fade out over the first third while their height and
  // the gap under them close, so no text squeezes and the bubble rides up with the layout; the chip
  // opens in height from the start and fades in over the last half. Opening plays it back. One duration
  // and one easing for every part, so nothing finishes on its own and snaps.
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
      duration: 300,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
    };
    if (chip && chipNew) {
      const chipHeight = chip.getBoundingClientRect().height;
      chip.animate(
        [
          { height: '0px', opacity: 0, overflow: 'hidden' },
          { opacity: 0, offset: 0.5 },
          { height: `${chipHeight}px`, opacity: 1, overflow: 'hidden' },
        ],
        timing,
      );
    }
    if (!folded) {
      host.classList.remove('steps-folded');
    }
    const height = steps.getBoundingClientRect().height;
    const margin = getComputedStyle(steps).marginBottom;
    const open = { height: `${height}px`, marginBottom: margin, opacity: 1, overflow: 'hidden' };
    const shut = { height: '0px', marginBottom: '0px', opacity: 0, overflow: 'hidden' };
    const run = steps.animate(
      folded
        ? [open, { opacity: 0, offset: 0.35 }, shut]
        : [shut, { opacity: 0, offset: 0.65 }, open],
      timing,
    );
    if (folded) {
      run.onfinish = () => host.classList.toggle('steps-folded', this.folded());
    }
  }
}
