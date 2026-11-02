import {
  Component,
  DestroyRef,
  ViewEncapsulation,
  inject,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
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
  type ChatMessageStatus,
} from 'ds/chat-message';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

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

const FAIL_PATH =
  'src/app/features/pricing/components/pricing-card/pricing-card.component.ts:42';

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
    NgTemplateOutlet,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './chat-message.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    './chat-message.section.scss',
  ],
})
export class ChatMessageSection {
  protected readonly failVariants = ['a', 'b', 'c'] as const;
  protected readonly failPath = FAIL_PATH;
  protected readonly failFrame = [
    { no: 41, text: '  @Input() set price(value: number) {', error: false },
    { no: 42, text: '    this.amount = value.toFixed(2);', error: true },
    { no: 43, text: '  }', error: false },
  ];
  protected readonly failLog = [
    '> ng build --configuration production',
    'Building...',
    `✘ [ERROR] TS2322: Type 'string' is not assignable to type 'number'. [plugin angular-compiler]`,
    `    ${FAIL_PATH}`,
    '      42 │     this.amount = value.toFixed(2);',
    '         ╵                   ~~~~~~~~~~~~~~~',
    ...Array.from(
      { length: 18 },
      (_, i) =>
        `    at Object.compile (/home/runner/work/prototype-studio/node_modules/@angular/build/src/tools/esbuild/angular/compiler-plugin.js:${120 + i}:17)`,
    ),
    'Application bundle generation failed. [4.213 seconds]',
  ];

  // The open failed step can hand its error to the message field, for the reader to say what to do.
  protected readonly askChip = signal<string | null>(null);

  protected askAboutError(): void {
    this.askChip.set(
      "Run the build: TS2322 Type 'string' is not assignable to type 'number'.",
    );
    queueMicrotask(() =>
      document
        .querySelector<HTMLInputElement>(
          '.fail-stage[data-variant="c"] .fail-field-input',
        )
        ?.focus(),
    );
  }

  protected copyLog(): void {
    void navigator.clipboard?.writeText(this.failLog.join('\n'));
  }

  private nextId = 0;
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
