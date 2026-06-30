export type DropzoneFileState = 'queued' | 'uploading' | 'success' | 'error';

export interface DropzoneFile {
  id: string;
  name: string;
  size: number;
  state: DropzoneFileState;
  progress: number;
  /** Human-readable status shown in place of the bare state name
   *  (e.g. "uploaded", "exceeds 10 MB limit"). */
  message?: string;
}
