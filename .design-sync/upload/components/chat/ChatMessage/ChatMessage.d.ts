import * as React from 'react';

/**
 * ChatMessage — the real ChatMessageComponent, run by Angular behind `<ds-chat-message>`.
 * One message of a chat (`ds-chat-message`), placed inside a `ChatThread`. The text is its content.
 */
export interface ChatMessageProps {
  /** Who wrote it: `'user'` draws a filled bubble on the right, `'assistant'` a subtle one on the left. */
  role?: ('user' | 'assistant' | 'system');
  /** What a `'system'` notice means. `'neutral'` is a quiet one-line plaque for a routine note (saved, switched, started); `'info'`, `'success'`, `'warning'` and `'error'` draw a card in that status colour with its icon, for a note the reader should not miss. Other roles ignore it. */
  tone?: ('neutral' | 'info' | 'success' | 'warning' | 'error');
  /** A bold first line of a `'system'` notice, for one that carries a detail under it. */
  title?: string;
  /** Icon at the start of a `'system'` notice. A toned notice shows its tone's icon without it; a `'neutral'` one shows none. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +76 more */ | null;
  /** Name shown above the bubble. Without it the role is spoken (`DS_INTL.chat.user` / `assistant`). */
  author?: string;
  /** Time label, already formatted, shown under the bubble. In a `ds-chat-thread` only the last message of a run shows it. */
  time?: string;
  /** When it was sent. Inside a `ds-chat-thread` it splits a run by time and dates the divider. */
  sentAt?: Date | string | number | null;
  /** The text is still arriving: a caret blinks after it and `[actions]` stay hidden until it is done. */
  streaming?: boolean;
  /** Delivery of a message the reader sent: `'sending'` dims it and `'failed'` says it was not sent and offers Retry, both in place of `time`. `'sent'` shows nothing and is only spoken. */
  status?: ('sending' | 'sent' | 'failed') | null;
  /** The `[steps]` fold into a chip at the top of the bubble, which opens them again; two-way bound. Inside a `ds-chat-thread` the steps of the reply before a new user message fold on their own (`foldStepsOnSend`). Folds only steps given as `ds-chat-step`s. */
  stepsFolded?: boolean;
  onStepsFoldedChange?: (value: boolean) => void;
  /** Retry was pressed on a `'failed'` message. Send it again and move `status` back to `'sending'`. */
  onRetry?: (value: void) => void;
  /** Content for the `[steps]` slot. */
  steps?: React.ReactNode;
  /** Content for the `[attachments]` slot. */
  attachments?: React.ReactNode;
  /** Content for the `[actions]` slot. */
  actions?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ChatMessage: React.ComponentType<ChatMessageProps>;
