import * as React from 'react';

/**
 * ChatThread — the real ChatThreadComponent, run by Angular behind `<ds-chat-thread>`.
 * The scrolling list of a chat (`ds-chat-thread`): its only expected children are `ChatMessage` elements. It follows new messages while the reader is at the end, keeps their place when they scroll up, and offers a jump button back to the latest.
 */
export interface ChatThreadProps {
  /** Shows the working row at the end of the thread: a spinner and `workingLabel`. */
  working?: boolean;
  /** The current step while `working`, such as "Rebuilding"; empty falls back to `DS_INTL.chat.working`. */
  workingLabel?: string;
  /** Accessible name of the scroll area; unset falls back to `DS_INTL.chat.thread`. */
  ariaLabel?: string | null;
  /** A new user message folds the steps of the replies before it (`ds-chat-message` `stepsFolded`). A reply keeps its steps open while it has a failed step the reader has not opened. */
  foldStepsOnSend?: boolean;
  /** Minutes between two messages' `sentAt` that start a new section with a time divider. */
  timeBreakMinutes?: number;
  /** More messages exist before the first one; scrolling near the start then emits `loadOlder`. */
  hasOlder?: boolean;
  /** Older messages are on their way: a spinner shows over the top of the list. */
  loadingOlder?: boolean;
  /** The reader scrolled near the start while `hasOlder` and not `loadingOlder`. Prepend the older messages; the thread keeps the message the reader was looking at in place. */
  onLoadOlder?: (value: void) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ChatThread: React.ComponentType<ChatThreadProps>;
