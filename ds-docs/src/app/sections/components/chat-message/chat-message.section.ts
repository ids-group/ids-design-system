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
  readonly sentAt: Date;
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
      sentAt: this.minutesAgo(30 - i),
    })),
  );
  protected readonly draft = signal('');
  protected readonly working = signal(false);
  // Minutes the demo clock has been moved forward, so the next message lands after a time break.
  private readonly clockOffset = signal(0);

  protected readonly pauseTimes = [64, 63, 12, 11].map((minutes) =>
    this.minutesAgo(minutes),
  );

  protected minutesAgo(minutes: number): Date {
    return new Date(Date.now() - minutes * 60_000);
  }

  protected wait(): void {
    this.clockOffset.update((offset) => offset + 20);
  }

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
      {
        id: this.nextId++,
        role,
        text,
        sentAt: this.minutesAgo(-this.clockOffset()),
      },
    ]);
  }
}
