import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import type { DropzoneFile } from './dropzone.types';
import { filesToAdd } from './dropzone.files';

@Component({
  selector: 'ds-dropzone',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './dropzone.component.html',
  styleUrl: './dropzone.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class DropzoneComponent {
  /** Native `accept` attribute — comma-separated MIME types or extensions. */
  readonly accept = input<string>('');
  /** Allows picking more than one file at once. Unset takes one, which is what the native input
   *  does with no `multiple`. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Files shown in the list — the consumer owns upload state and progress. */
  readonly files = model<DropzoneFile[]>([]);
  /** Disables the dropzone: blocks all file-picking interactions and signals unavailability. */
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly dragOver = signal<boolean>(false);

  /** Fires with the raw files picked or dropped; the consumer adds them to `files`. */
  readonly filesAdded = output<File[]>();
  /** Fires when the user removes a file; unlike `filesAdded`, the consumer must remove the matching entry from `files` itself. */
  readonly fileRemoved = output<DropzoneFile>();

  protected readonly classes = computed(() => {
    const parts = ['dropzone'];
    if (this.dragOver()) {
      parts.push('active');
    }
    if (this.files().length > 0) {
      parts.push('has-files');
    }
    if (this.disabled()) {
      parts.push('disabled');
    }

    return parts.join(' ');
  });

  protected onDragOver(event: DragEvent): void {
    if (this.disabled()) {
      return;
    }
    event.preventDefault();
    this.dragOver.set(true);
  }

  protected onDragLeave(): void {
    this.dragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    if (this.disabled()) {
      return;
    }
    this.emitPicked(event.dataTransfer?.files);
  }

  protected onPickerChange(event: Event): void {
    if (this.disabled()) {
      return;
    }
    this.emitPicked((event.target as HTMLInputElement).files);
  }

  private emitPicked(list: FileList | null | undefined): void {
    const picked = filesToAdd(list ? Array.from(list) : [], this.multiple());
    if (picked.length) {
      this.filesAdded.emit([...picked]);
    }
  }

  protected onRemove(file: DropzoneFile): void {
    this.fileRemoved.emit(file);
  }

  protected fileMeta(file: DropzoneFile): string {
    const size = this.formatSize(file.size);
    if (file.message) {
      return `${size} · ${file.message}`;
    }
    if (file.state === 'queued') {
      return size;
    }

    return `${size} · ${file.state}`;
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  protected fileIcon(state: DropzoneFile['state']): 'file' | 'check' | 'error' {
    if (state === 'success') {
      return 'check';
    }
    if (state === 'error') {
      return 'error';
    }

    return 'file';
  }
}
