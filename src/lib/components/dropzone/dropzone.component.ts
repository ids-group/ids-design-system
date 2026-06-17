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
import { IconComponent } from '../../icons/icon.component';
import type { DropzoneFile } from './dropzone.types';

@Component({
  selector: 'ds-dropzone',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './dropzone.component.html',
  styleUrl: './dropzone.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class DropzoneComponent {
  readonly accept = input<string>('');
  readonly multiple = input<boolean>(false);
  readonly files = model<DropzoneFile[]>([]);
  /** Disables the dropzone: blocks all file-picking interactions and signals unavailability. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Restricts the dropzone to a single file; narrows the panel to `--col-cap-text`. */
  readonly single = input(false, { transform: booleanAttribute });

  protected readonly dragOver = signal<boolean>(false);

  readonly filesAdded = output<File[]>();
  readonly fileRemoved = output<DropzoneFile>();

  protected readonly classes = computed(() => {
    const parts = ['dropzone'];
    if (this.dragOver()) {parts.push('active');}
    if (this.files().length > 0) {parts.push('has-files');}
    if (this.disabled()) {parts.push('disabled');}
    if (this.single()) {parts.push('single');}

    return parts.join(' ');
  });

  protected onDragOver(event: DragEvent): void {
    if (this.disabled()) {return;}
    event.preventDefault();
    this.dragOver.set(true);
  }

  protected onDragLeave(): void {
    this.dragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    if (this.disabled()) {return;}
    const list = event.dataTransfer?.files;
    if (list) {this.filesAdded.emit(Array.from(list));}
  }

  protected onPickerChange(event: Event): void {
    if (this.disabled()) {return;}
    const list = (event.target as HTMLInputElement).files;
    if (list) {this.filesAdded.emit(Array.from(list));}
  }

  protected onRemove(file: DropzoneFile): void {
    this.fileRemoved.emit(file);
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) {return `${bytes} B`;}
    if (bytes < 1024 * 1024) {return `${(bytes / 1024).toFixed(1)} KB`;}

    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  protected fileIcon(state: DropzoneFile['state']): 'file' | 'check' | 'error' {
    if (state === 'success') {return 'check';}
    if (state === 'error') {return 'error';}

    return 'file';
  }
}
