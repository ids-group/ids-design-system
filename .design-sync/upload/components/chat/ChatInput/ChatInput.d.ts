import * as React from 'react';

/**
 * ChatInput — the real ChatInputComponent, run by Angular behind `<ds-chat-input>`.
 * Message box for a chat or an instruction (`ds-chat-input`): an auto-growing text area in a bordered frame with a send button. Enter sends, Shift+Enter breaks the line.
 */
export interface ChatInputProps {
  /** Message text, two-way bound. Not cleared on submit: clear it once the message is accepted. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Placeholder shown when empty. */
  placeholder?: string;
  /** Accessible name of the text area; unset falls back to `DS_INTL.chatInput.label`. */
  ariaLabel?: string | null;
  /** Height in lines the text area starts at. */
  minRows?: number;
  /** Height in lines the text area grows to before it scrolls. */
  maxRows?: number;
  /** Disables the text area and the send button. Projected controls are the consumer's to disable. */
  disabled?: boolean;
  /** Work in flight: the send button keeps its place, shows a spinner and refuses to submit, and Enter does not submit. The text area stays editable. */
  busy?: boolean;
  /** While `busy`, the default send button becomes Stop: a square inside a turning ring that emits `stopRequested`. */
  stoppable?: boolean;
  /** What the default buttons offer while `busy` once text is typed. `'stop'`: the send button stays Stop (or the spinner). `'queue'`: Redirect, Stop (with `stoppable`) and Queue, left to right; Queue is the main button and Enter queues. With no text it is Stop again. */
  busyAction?: ('stop' | 'queue');
  /** The current step while `busy`, such as "Rebuilding"; where it shows follows `layout`. */
  busyLabel?: string;
  /** Where the buttons and the step text sit. `'status-bar'`: buttons inside, the step text in the bar beside a fixed-size send button. `'status-above'`: the step text on a line above the box. `'split'`: attach outside on the left, send outside on the right, the step text above. `'send-outside'`: attach and the step inside, a round send button outside on the right. `'toolbar'`: the box holds the text, attach, the step and send sit in a row under it. */
  layout?: ('status-bar' | 'status-above' | 'split' | 'send-outside' | 'toolbar');
  /** The trimmed text, on Enter or the send button. Never fires for blank text, while `busy` or while `disabled`. */
  onSubmitted?: (value: string) => void;
  /** The Stop button was pressed; fires only while `busy`, `stoppable` and not `disabled`. */
  onStopRequested?: (value: void) => void;
  /** The trimmed text, on Enter or the Queue button; fires only while the Queue button shows. */
  onQueued?: (value: string) => void;
  /** The trimmed text, on the Redirect button; fires only while the Queue button shows. */
  onRedirected?: (value: string) => void;
  /** Image files pasted into the text area. The paste inserts no text when it carries images. */
  onFilesPasted?: (value: File[]) => void;
  /** Content for the `[attachments]` slot. */
  attachments?: React.ReactNode;
  /** Content for the `[chips]` slot. */
  chips?: React.ReactNode;
  /** Content for the `[actions]` slot. */
  actions?: React.ReactNode;
  /** Content for the `[send]` slot. */
  send?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ChatInput: React.ComponentType<ChatInputProps>;
