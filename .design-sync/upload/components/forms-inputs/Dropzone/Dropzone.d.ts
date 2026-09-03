import * as React from 'react';

/**
 * Dropzone — the real DropzoneComponent, run by Angular behind `<ds-dropzone>`.
 * File upload drop target — port of `ds-dropzone`. The whole panel is a label around a hidden file input, so clicking anywhere opens the native picker; drag-and-drop also works. The consumer owns the file list and upload state.
 */
export interface DropzoneProps {
  /** Native `accept` attribute — comma-separated MIME types or extensions. */
  accept?: string;
  /** Allows picking more than one file at once (ignored when `single`). */
  multiple?: boolean;
  /** Files shown in the list — the consumer owns upload state and progress. */
  files?: unknown;
  onFilesChange?: (value: unknown) => void;
  /** Disables the dropzone: blocks all file-picking interactions and signals unavailability. */
  disabled?: boolean;
  /** Restricts the dropzone to a single file; narrows the panel to `--col-cap-text`. */
  single?: boolean;
  /** Fires with the raw files picked or dropped; the consumer adds them to `files`. */
  onFilesAdded?: (value: File[]) => void;
  /** Fires when the user removes a file; unlike `filesAdded`, the consumer must remove the matching entry from `files` itself. */
  onFileRemoved?: (value: unknown) => void;
  /** Content for the `[hint]` slot. */
  hint?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Dropzone: React.ComponentType<DropzoneProps>;
