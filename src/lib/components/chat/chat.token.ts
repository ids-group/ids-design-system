import { InjectionToken, type Signal } from '@angular/core';

/** Contract that ds-chat-message reads from its parent ds-chat-thread. */
export interface ChatThreadContract {
  /** The first message, which takes no space above it. */
  readonly firstMessage: Signal<object | undefined>;
  /** Messages that follow one of the same role with no time break, drawn closer to it. */
  readonly groupedMessages: Signal<ReadonlySet<object>>;
  /** Messages followed by one of the same run, drawn joined to it. */
  readonly continuedMessages: Signal<ReadonlySet<object>>;
  /** Messages that open a time section, with the divider text shown above them. */
  readonly timeBreaks: Signal<ReadonlyMap<object, string>>;
  /** True once the thread has rendered: steps that arrive after it grow in. */
  readonly live: Signal<boolean>;
  /** Whether the message arrived after the thread rendered and below the messages already there; it
   *  grows in. Older messages prepended above do not, so the reader's place holds. */
  appendedAfterRender(message: object): boolean;
}

export const CHAT_THREAD = new InjectionToken<ChatThreadContract>(
  'CHAT_THREAD',
);

/** Contract that ds-chat-step reads from its parent ds-chat-steps. */
export interface ChatStepsContract {
  /** The step that draws no gap above it. */
  readonly firstStep: Signal<object | undefined>;
  /** The step that draws no gap below it. */
  readonly lastStep: Signal<object | undefined>;
  /** Milliseconds from now before a step that settles now may show it, given when it began running. */
  settleDelay(runningSince: number): number;
}

export const CHAT_STEPS = new InjectionToken<ChatStepsContract>('CHAT_STEPS');
