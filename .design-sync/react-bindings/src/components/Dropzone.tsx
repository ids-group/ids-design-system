import * as React from 'react';
import { cx, host } from '../lib/util';
import { Icon } from '../lib/Icon';

export type DropzoneFileState = 'queued' | 'uploading' | 'success' | 'error';

export interface DropzoneFile {
  id: string;
  name: string;
  size: number;
  state: DropzoneFileState;
  /** 0–100, drawn as the bar width while `state === 'uploading'`. */
  progress: number;
  /** Human-readable status shown in place of the bare state name
   *  (e.g. "uploaded", "exceeds 10 MB limit"). */
  message?: string;
}

export interface DropzoneProps {
  /** Native `accept` attribute — comma-separated MIME types or extensions. */
  accept?: string;
  /** Allows picking more than one file at once (ignored when `single`). */
  multiple?: boolean;
  /** Files shown in the list — the consumer owns upload state and progress
   *  (the component never mutates it; append on `onFilesAdded`). */
  files?: readonly DropzoneFile[];
  /** Disables the dropzone: blocks all file-picking interactions. */
  disabled?: boolean;
  /** Restricts the dropzone to a single file; narrows the panel. */
  single?: boolean;
  /** Force the drag-over highlight — for static rendering of the `active`
   *  state. Live drag events drive it when omitted. */
  dragOver?: boolean;
  /** Extra guidance under the hint line (the `<ng-content select="[hint]">` slot). */
  hint?: React.ReactNode;
  /** Fires with the raw files picked or dropped; the consumer adds them to `files`. */
  onFilesAdded?: (files: File[]) => void;
  /** Fires when the user removes a file from the list. */
  onFileRemoved?: (file: DropzoneFile) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileMeta(file: DropzoneFile): string {
  const size = formatSize(file.size);
  if (file.message) return `${size} · ${file.message}`;
  if (file.state === 'queued') return size;
  return `${size} · ${file.state}`;
}

function fileIcon(state: DropzoneFileState): 'file' | 'check' | 'error' {
  if (state === 'success') return 'check';
  if (state === 'error') return 'error';
  return 'file';
}

/** File upload drop target — port of `ds-dropzone`. The whole panel is a
 *  `<label>` around a hidden file input, so clicking anywhere opens the native
 *  picker. Empty → upload prompt; with `files` → per-file rows with state
 *  icon, meta line and an uploading progress bar. */
export function Dropzone({
  accept = '',
  multiple = false,
  files = [],
  disabled = false,
  single = false,
  dragOver,
  hint,
  onFilesAdded,
  onFileRemoved,
}: DropzoneProps) {
  const [ownDragOver, setOwnDragOver] = React.useState(false);
  const isDragOver = dragOver ?? ownDragOver;

  const classes = cx(
    'dropzone',
    isDragOver && 'active',
    files.length > 0 && 'has-files',
    disabled && 'disabled',
    single && 'single',
  );

  return host(
    'ds-dropzone',
    null,
    <label
      className={classes}
      aria-disabled={disabled ? 'true' : undefined}
      onDragOver={(event) => {
        if (disabled) return;
        event.preventDefault();
        setOwnDragOver(true);
      }}
      onDragLeave={() => setOwnDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOwnDragOver(false);
        if (disabled) return;
        const list = event.dataTransfer?.files;
        if (list) onFilesAdded?.(Array.from(list));
      }}
    >
      <input
        type="file"
        className="dz-input"
        aria-label="Upload files"
        accept={accept || undefined}
        multiple={single ? false : multiple}
        disabled={disabled}
        onChange={(event) => {
          if (disabled) return;
          const list = event.target.files;
          if (list) onFilesAdded?.(Array.from(list));
        }}
      />
      {files.length === 0 ? (
        <>
          <Icon name="upload" size={24} />
          <div className="title">Drop files here</div>
          <div className="hint">or click to browse</div>
          {hint}
        </>
      ) : (
        <div className="file-list">
          {files.map((file) => (
            <div key={file.id} className={`file ${file.state}`}>
              <Icon className="icon" name={fileIcon(file.state)} size={20} />
              <div className="main">
                <div className="name">{file.name}</div>
                <div className="meta">{fileMeta(file)}</div>
                {file.state === 'uploading' && (
                  <div className="progress">
                    <div className="progress-fill" style={{ width: `${file.progress}%` }} />
                  </div>
                )}
              </div>
              <button
                className="remove"
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onFileRemoved?.(file);
                }}
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </label>,
  );
}
