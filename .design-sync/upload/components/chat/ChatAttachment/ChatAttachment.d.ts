import * as React from 'react';

/**
 * ChatAttachment — the real ChatAttachmentComponent, run by Angular behind `<ds-chat-attachment>`.
 * What a sent message was about (`ds-chat-attachment`): a pill chip in a chat message's attachments row with a label and the page it came from. Clicked, it opens into a card on its own line that frames `children`, such as a snapshot of the picked element.
 */
export interface ChatAttachmentProps {
  /** Chip text: the file name, or the picked element's name. */
  label?: string;
  /** Where it came from, shown muted after the label: the page or screen it was picked on. */
  source?: string;
  /** Icon before the label. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +76 more */ | null;
  /** Whether the snapshot is open, two-way bound. */
  expanded?: boolean;
  onExpandedChange?: (value: boolean) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ChatAttachment: React.ComponentType<ChatAttachmentProps>;
