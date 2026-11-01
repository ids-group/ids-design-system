import { InjectionToken, type Signal } from '@angular/core';

/** Contract that ds-chat-message reads from its parent ds-chat-thread. */
export interface ChatThreadContract {
  /** The first message, which takes no space above it. */
  readonly firstMessage: Signal<object | undefined>;
  /** Messages that follow one of the same role with no time break, drawn closer to it. */
  readonly groupedMessages: Signal<ReadonlySet<object>>;
  /** Messages that open a time section, with the divider text shown above them. */
  readonly timeBreaks: Signal<ReadonlyMap<object, string>>;
}

export const CHAT_THREAD = new InjectionToken<ChatThreadContract>(
  'CHAT_THREAD',
);
