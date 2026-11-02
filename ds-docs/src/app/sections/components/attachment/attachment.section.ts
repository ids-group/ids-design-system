import { Component, ViewEncapsulation, signal } from '@angular/core';
import { AttachmentComponent } from 'ds/attachment';
import { IconButtonComponent } from 'ds/icon-button';
import { MessageInputComponent } from 'ds/message-input';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

const SCREENSHOT = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 48"><rect width="68" height="48" fill="#f6f7f9"/><rect width="68" height="10" fill="#1d2330"/><rect x="6" y="16" width="38" height="4" rx="1" fill="#4b5563"/><rect x="6" y="24" width="26" height="4" rx="1" fill="#c9ced6"/><rect x="6" y="33" width="20" height="9" rx="2" fill="#3d5afe"/></svg>',
)}`;

interface DemoFile {
  readonly name: string;
  readonly meta: string;
  readonly kind: 'pdf' | 'doc' | 'image' | 'file';
  readonly previewUrl: string | null;
}

@Component({
  selector: 'section-components-attachment',
  standalone: true,
  imports: [
    DocsSectionComponent,
    AttachmentComponent,
    IconButtonComponent,
    MessageInputComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './attachment.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './attachment.section.scss'],
})
export class AttachmentSection {
  protected readonly screenshot = SCREENSHOT;
  protected readonly files = signal<readonly DemoFile[]>([
    { name: 'Brief.pdf', meta: 'PDF · 240 KB', kind: 'pdf', previewUrl: null },
    { name: 'Scope.docx', meta: 'Word · 38 KB', kind: 'doc', previewUrl: null },
    {
      name: 'screenshot.png',
      meta: 'Image · 1280×720',
      kind: 'image',
      previewUrl: SCREENSHOT,
    },
  ]);

  protected remove(name: string): void {
    this.files.update((files) => files.filter((file) => file.name !== name));
  }
}
