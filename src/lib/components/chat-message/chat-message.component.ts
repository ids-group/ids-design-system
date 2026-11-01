import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  DS_INTL,
  DS_INTL_DEFAULTS,
} from '@ids-group-ltd/ids-design-system/core';
import { CHAT_THREAD } from './chat.token';
import type { ChatMessageRole } from './chat.types';

/**
 * One message of a conversation: a bubble on the right for the user, on the left for the
 * assistant. Slots: default (the text or rendered markdown), `[steps]` (a `ds-timeline` of the
 * agent's steps, above the bubble), `[attachments]` (under the text), `[actions]` (under the bubble).
 */
@Component({
  selector: 'ds-chat-message',
  standalone: true,
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

  protected readonly speaker = computed(() => {
    const wording = { ...DS_INTL_DEFAULTS.chat, ...this.intl().chat };

    return this.author() || wording[this.role()];
  });
}
