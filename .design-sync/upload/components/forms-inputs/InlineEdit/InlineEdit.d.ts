import * as React from 'react';

/**
 * InlineEdit — the real InlineEditComponent, run by Angular behind `<ds-inline-edit>`.
 * Text renamed in place (`ds-inline-edit`): plain text that turns into a field of the same font and size on a click, Enter, Space or F2, with the text selected. Hover tints the background behind the text and shows a pencil with a "Rename" tooltip.
 */
export interface InlineEditProps {
  /** The text, two-way bound. Changes only on a save of a non-blank, different value. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Shown, muted, while the value is empty, and in the empty field. */
  placeholder?: string;
  /** Longest value the field accepts, in characters; `null` for no limit. */
  maxLength?: number | null;
  /** Shows the text without the edit affordance and refuses to edit. */
  disabled?: boolean;
  /** What the text is, such as "Chat title"; names the text and the field. Unset falls back to `DS_INTL.inlineEdit.rename`. */
  ariaLabel?: string | null;
  /** The trimmed new value, after a save that changed it. */
  onSaved?: (value: string) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const InlineEdit: React.ComponentType<InlineEditProps>;
