import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { InputComponent } from 'ds/input';
import { TagComponent } from 'ds/tag';
import { IconButtonComponent } from 'ds/icon-button';
import { TimelineComponent, TimelineItemComponent } from 'ds/timeline';
import {
  ChatAttachmentComponent,
  ChatMessageComponent,
  ChatThreadComponent,
  type ChatMessageRole,
} from 'ds/chat-message';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface DemoMessage {
  readonly id: number;
  readonly role: ChatMessageRole;
  readonly text: string;
}

const REPLIES = [
  'Done. The header now uses the brand colour and the search moved to the right.',
  'I rebuilt the list page; the table keeps its sort when you come back to it.',
  'Both themes checked: the contrast of the muted text is above 4.5:1 in each.',
];

@Component({
  selector: 'section-components-chat-message',
  standalone: true,
  imports: [
    DocsSectionComponent,
    ChatMessageComponent,
    ChatThreadComponent,
    ChatAttachmentComponent,
    TimelineComponent,
    TimelineItemComponent,
    TagComponent,
    ButtonComponent,
    IconButtonComponent,
    InputComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './chat-message.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    './chat-message.section.scss',
  ],
})
export class ChatMessageSection {
  private nextId = 0;

  protected readonly messages = signal<readonly DemoMessage[]>(
    Array.from({ length: 6 }, (_, i) => ({
      id: this.nextId++,
      role: i % 2 ? 'assistant' : 'user',
      text: i % 2 ? REPLIES[i % REPLIES.length] : `Request number ${i / 2 + 1}`,
    })),
  );
  protected readonly draft = signal('');
  protected readonly working = signal(false);

  protected send(event: Event): void {
    event.preventDefault();
    const text = this.draft().trim();
    if (text) {
      this.add('user', text);
      this.draft.set('');
    }
  }

  protected reply(): void {
    this.add('assistant', REPLIES[this.nextId % REPLIES.length]);
  }

  private add(role: ChatMessageRole, text: string): void {
    this.messages.update((list) => [
      ...list,
      { id: this.nextId++, role, text },
    ]);
  }
}
