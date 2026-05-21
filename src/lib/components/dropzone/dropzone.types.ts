export type DropzoneFileState = 'uploading' | 'success' | 'error';

export interface DropzoneFile {
  id: string;
  name: string;
  size: number;
  state: DropzoneFileState;
  progress: number;
}
