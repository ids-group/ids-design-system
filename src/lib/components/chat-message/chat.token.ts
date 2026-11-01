import { InjectionToken, type Signal } from '@angular/core';

/** Contract that ds-chat-message reads from its parent ds-chat-thread. */
export interface ChatThreadContract {
  /** The first message, which takes no space above it. */
  readonly firstMessage: Signal<object | undefined>;
  /** Messages that follow one of the same role, drawn closer to it. */
  readonly groupedMessages: Signal<ReadonlySet<object>>;
}

export const CHAT_THREAD = new InjectionToken<ChatThreadContract>(
  'CHAT_THREAD',
);
