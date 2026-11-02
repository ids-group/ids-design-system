import {
  Component,
  DestroyRef,
  ViewEncapsulation,
  inject,
  signal,
} from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { InputComponent } from 'ds/input';
import { TagComponent } from 'ds/tag';
import { IconButtonComponent } from 'ds/icon-button';
import {
  TimelineComponent,
  TimelineItemComponent,
  type TimelineStatus,
} from 'ds/timeline';
import {
  ChatAttachmentComponent,
  ChatMessageComponent,
  ChatThreadComponent,
  type ChatMessageRole,
  type ChatMessageStatus,
  type ChatStepsEnter,
} from 'ds/chat-message';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface FoldTurn {
  readonly id: number;
  readonly request: string;
  readonly steps: readonly { heading: string; status: TimelineStatus }[];
  readonly reply: string;
}

interface DemoMessage {
  readonly id: number;
  readonly role: ChatMessageRole;
  readonly text: string;
  readonly sentAt: Date;
  readonly streaming?: boolean;
  readonly status?: ChatMessageStatus;
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

  protected readonly planEnter = signal<ChatStepsEnter>('together');

  protected readonly foldTurns = signal<readonly FoldTurn[]>([
    {
      id: 0,
      request: 'Make the header blue.',
      steps: [
        'Reading the page',
        'Editing the header',
        'Rebuilding',
        'Checking the screen',
      ].map((heading) => ({ heading, status: 'done' as TimelineStatus })),
      reply: 'Done: the header is blue now.',
    },
  ]);

  // A request: the reader's message, then the agent's steps, then its reply. `planned` returns the
  // whole plan at once and runs it step by step; otherwise each step appears as it starts.
  protected sendFoldTurn(kind: 'next' | 'fails' | 'planned' = 'next'): void {
    const id = this.foldTurns().length;
    const headings =
      kind === 'planned'
        ? [
            'Reading the page',
            'Editing the footer',
            'Rebuilding',
            'Checking the screen',
          ]
        : ['Reading the page', 'Editing the header', 'Rebuilding'];
    const request = {
      next: 'And move the logo to the left.',
      fails: 'Publish it.',
      planned: 'Add a footer with the address.',
    }[kind];
    const reply = {
      next: 'Moved the logo to the left.',
      fails: 'The rebuild failed; open the step to see why.',
      planned: 'Added the footer with the address.',
    }[kind];
    this.foldTurns.update((turns) => [
      ...turns,
      { id, request, steps: [], reply: '' },
    ]);
    const patch = (change: (turn: FoldTurn) => Partial<FoldTurn>) =>
      this.foldTurns.update((turns) =>
        turns.map((turn) =>
          turn.id === id ? { ...turn, ...change(turn) } : turn,
        ),
      );
    const setStatus = (index: number, status: TimelineStatus) =>
      patch((turn) => ({
        steps: turn.steps.map((step, i) =>
          i === index ? { ...step, status } : step,
        ),
      }));
    const stepTime = 1500;
    const start = 600;
    if (kind === 'planned') {
      this.later(
        () =>
          patch(() => ({
            steps: headings.map((heading) => ({
              heading,
              status: 'pending' as TimelineStatus,
            })),
          })),
        start,
      );
    }
    headings.forEach((heading, index) => {
      const begin = start + 500 + index * stepTime;
      this.later(() => {
        if (kind === 'planned') {
          setStatus(index, 'running');
        } else {
          patch((turn) => ({
            steps: [
              ...turn.steps,
              { heading, status: 'running' as TimelineStatus },
            ],
          }));
        }
      }, begin);
      const fails = kind === 'fails' && heading === 'Rebuilding';
      this.later(
        () => setStatus(index, fails ? 'error' : 'done'),
        begin + stepTime - 200,
      );
    });
    this.later(
      () => patch(() => ({ reply })),
      start + 500 + headings.length * stepTime,
    );
  }

  private olderPages = 0;
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();

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
  protected readonly failNext = signal(false);
  protected readonly hasOlder = signal(true);
  protected readonly loadingOlder = signal(false);
  // Minutes the demo clock has been moved forward, so the next message lands after a time break.
  private readonly clockOffset = signal(0);

  protected readonly pauseTimes = [64, 63, 12, 11].map((minutes) =>
    this.minutesAgo(minutes),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearTimeout));
  }

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
      const id = this.add({ role: 'user', text, status: 'sending' });
      this.draft.set('');
      this.deliver(id);
    }
  }

  protected retry(id: number): void {
    this.patch(id, { status: 'sending' });
    this.deliver(id);
  }

  // A reply streams in a few words at a time, then completes.
  protected reply(): void {
    const words = REPLIES[this.nextId % REPLIES.length].split(' ');
    const id = this.add({ role: 'assistant', text: '', streaming: true });
    words.forEach((_, index) =>
      this.later(
        () => {
          const done = index === words.length - 1;
          this.patch(id, {
            text: words.slice(0, index + 1).join(' '),
            streaming: !done,
          });
        },
        120 * (index + 1),
      ),
    );
  }

  protected loadOlder(): void {
    this.loadingOlder.set(true);
    this.later(() => {
      const page = ++this.olderPages;
      const older: DemoMessage[] = Array.from({ length: 6 }, (_, i) => ({
        id: this.nextId++,
        role: i % 2 ? 'assistant' : 'user',
        text: `Earlier message ${page}.${i + 1}`,
        sentAt: this.minutesAgo(60 * page + 30 - i),
      }));
      this.messages.update((list) => [...older, ...list]);
      this.loadingOlder.set(false);
      this.hasOlder.set(page < 3);
    }, 700);
  }

  private deliver(id: number): void {
    const fail = this.failNext();
    this.failNext.set(false);
    this.later(() => this.patch(id, { status: fail ? 'failed' : 'sent' }), 600);
  }

  private add(message: Omit<DemoMessage, 'id' | 'sentAt'>): number {
    const id = this.nextId++;
    this.messages.update((list) => [
      ...list,
      { ...message, id, sentAt: this.minutesAgo(-this.clockOffset()) },
    ]);

    return id;
  }

  private patch(id: number, change: Partial<DemoMessage>): void {
    this.messages.update((list) =>
      list.map((message) =>
        message.id === id ? { ...message, ...change } : message,
      ),
    );
  }

  private later(run: () => void, delay: number): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      run();
    }, delay);
    this.timers.add(timer);
  }
}
