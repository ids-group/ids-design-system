import * as React from 'react';

/**
 * Attachment — the real AttachmentComponent, run by Angular behind `<ds-attachment>`.
 * A file attached to a message (`ds-attachment`): a type tile, or the image itself, then the file name and a second muted line. Place it in the `chips` slot of `ChatInput`, before the message is sent.
 */
export interface AttachmentProps {
  /** File name, shown on the first line and used in the remove button's accessible name. */
  name?: string;
  /** Second line, such as `'PDF · 240 KB'`. */
  meta?: string;
  /** Draws the type tile and is announced before `meta`. */
  kind?: ('pdf' | 'doc' | 'image' | 'file');
  /** Image shown in place of the tile when `kind` is `'image'`. */
  previewUrl?: string | null;
  /** Shows a remove button that emits `removed`. */
  removable?: boolean;
  /** Fires when the remove button is pressed. */
  onRemoved?: (value: void) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Attachment: React.ComponentType<AttachmentProps>;
