import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  DS_INTL,
  DS_INTL_DEFAULTS,
  injectDsLocale,
} from '@ids-group-ltd/ids-design-system/core';
import { ButtonComponent } from '@ids-group-ltd/ids-design-system/components/button';
import { SpinnerComponent } from '@ids-group-ltd/ids-design-system/components/spinner';
import { CHAT_THREAD } from './chat.token';
import { ChatMessageComponent } from './chat-message.component';

// Closer to the end than this still counts as at the end, so a sub-pixel scroll position or a
// small nudge does not unpin the thread.
const PIN_TOLERANCE_PX = 32;

// Closer to the start than this asks for older messages.
const OLDER_THRESHOLD_PX = 64;

/**
 * Scrollable list of `ds-chat-message`s that stays at the newest message unless the reader has
 * scrolled up, then offers a jump button instead. Groups consecutive messages of one role, shows a
 * working row while `working`, and announces each finished reply once.
 */
@Component({
  selector: 'ds-chat-thread',
  standalone: true,
  imports: [ButtonComponent, SpinnerComponent],
  templateUrl: './chat-thread.component.html',
  styleUrl: './chat-thread.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: CHAT_THREAD,
      useExisting: forwardRef(() => ChatThreadComponent),
    },
  ],
})
export class ChatThreadComponent {
  /** Shows the working row at the end of the thread: a spinner and `workingLabel`. */
  readonly working = input(false, { transform: booleanAttribute });
  /** The current step while `working`, such as "Rebuilding"; empty falls back to `DS_INTL.chat.working`. */
  readonly workingLabel = input<string>('');
  /** Accessible name of the scroll area; unset falls back to `DS_INTL.chat.thread`. */
  readonly ariaLabel = input<string | null>(null);
  /** A new user message folds the steps of the replies before it (`ds-chat-message` `stepsFolded`).
   *  A reply keeps its steps open while it has a failed step the reader has not opened. */
  readonly foldStepsOnSend = input(true, { transform: booleanAttribute });
  /** Minutes between two messages' `sentAt` that start a new section with a time divider. */
  readonly timeBreakMinutes = input<number>(15);
  /** More messages exist before the first one; scrolling near the start then emits `loadOlder`. */
  readonly hasOlder = input(false, { transform: booleanAttribute });
  /** Older messages are on their way: a spinner shows over the top of the list. */
  readonly loadingOlder = input(false, { transform: booleanAttribute });

  /** The reader scrolled near the start while `hasOlder` and not `loadingOlder`. Prepend the older
   *  messages; the thread keeps the message the reader was looking at in place. */
  readonly loadOlder = output<void>();

  // Descendants, so a message inside a wrapper element or an @for block still counts.
  private readonly messages = contentChildren(ChatMessageComponent, {
    descendants: true,
  });

  /** The first message, which takes no space above it. */
  readonly firstMessage = computed<object | undefined>(() =>
    this.messages().at(0),
  );

  /** Messages that open a time section, with their divider text: the first message with a
   *  `sentAt`, and each one sent `timeBreakMinutes` or more after the message before it. */
  readonly timeBreaks = computed<ReadonlyMap<object, string>>(() => {
    const breaks = new Map<object, string>();
    const gap = this.timeBreakMinutes() * 60_000;
    let previous: number | null = null;
    for (const message of this.messages()) {
      const sent = message.sentAtMs();
      if (sent !== null && (previous === null || sent - previous >= gap)) {
        breaks.set(message, this.dividerText(sent));
      }
      previous = sent ?? previous;
    }

    return breaks;
  });

  /** Messages that follow one of the same role with no time break between them. */
  readonly groupedMessages = computed<ReadonlySet<object>>(() => {
    const list = this.messages();
    const breaks = this.timeBreaks();

    return new Set(
      list.filter(
        (message, i) =>
          i > 0 &&
          message.role() === list[i - 1].role() &&
          !breaks.has(message),
      ),
    );
  });

  /** Messages followed by one of the same run. */
  readonly continuedMessages = computed<ReadonlySet<object>>(() => {
    const list = this.messages();
    const grouped = this.groupedMessages();

    return new Set(list.filter((_, i) => grouped.has(list[i + 1])));
  });

  private readonly intl = inject(DS_INTL);
  private readonly locale = injectDsLocale();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly scroller =
    viewChild.required<ElementRef<HTMLElement>>('scroller');
  private readonly content =
    viewChild.required<ElementRef<HTMLElement>>('content');

  private readonly wording = computed(() => ({
    ...DS_INTL_DEFAULTS.chat,
    ...this.intl().chat,
  }));
  protected readonly label = computed(
    () => this.ariaLabel() || this.wording().thread,
  );
  protected readonly workingText = computed(
    () => this.workingLabel() || this.wording().working,
  );

  private readonly appended = new WeakSet<object>();

  /** @internal */
  appendedAfterRender(message: object): boolean {
    return this.appended.has(message);
  }

  /** True once the thread has rendered. @internal */
  readonly live = signal(false);

  protected readonly pinned = signal(true);
  protected readonly unseen = signal(0);
  protected readonly announcement = signal('');
  protected readonly jumpLabel = computed(() => {
    const count = this.unseen();

    return count ? this.wording().newMessages(count) : this.wording().latest;
  });

  constructor() {
    afterNextRender(() => {
      this.live.set(true);
      this.toEnd();
      // Growth of the content (a new message, a streamed line, an opened snapshot) and a smaller
      // viewport both move the end away; a pinned thread follows it.
      const observer = new ResizeObserver(() => {
        if (this.pinned()) {
          this.toEnd();
        } else {
          this.holdAnchor();
        }
        this.recordAnchor();
      });
      observer.observe(this.content().nativeElement);
      observer.observe(this.scroller().nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });

    // The messages present at the first render, or the first batch to arrive into an empty
    // thread, are history: they are scrolled to, never announced.
    let seen = -1;
    let lastMessage: object | undefined;
    let known = new Set<ChatMessageComponent>();
    effect(() => {
      const list = this.messages();
      untracked(() => {
        const previous = seen;
        const previousLast = lastMessage;
        const added =
          previous > 0 ? list.filter((message) => !known.has(message)) : [];
        const lastKnown =
          previous > 0
            ? list.indexOf(previousLast as ChatMessageComponent)
            : -1;
        for (const message of added) {
          if (list.indexOf(message) > lastKnown) {
            this.appended.add(message);
          }
        }
        known = new Set(list);
        seen = list.length;
        lastMessage = list.at(-1);
        if (added.length && this.foldStepsOnSend()) {
          this.afterRender(() => this.foldBefore(list, added));
        }
        this.olderRequested = false;
        // Messages prepended by `loadOlder` leave the last one in place and are not new.
        if (
          previous > 0 &&
          list.length > previous &&
          list.at(-1) !== previousLast
        ) {
          // After the render: a message created in this pass has not read its `role` input yet.
          this.afterRender(() => this.onArrival());
        }
      });
    });

    // A reply that was still streaming is read once its text is complete.
    let streaming = new Set<object>();
    effect(() => {
      const now = new Set<object>(
        this.messages().filter((message) => message.streaming()),
      );
      untracked(() => {
        const finished = [...streaming].some((message) => !now.has(message));
        streaming = now;
        if (finished && !this.working()) {
          this.afterRender(() => this.announceLastReply());
        }
      });
    });

    effect(() => {
      if (!this.loadingOlder()) {
        this.olderRequested = false;
      }
    });

    let wasWorking = false;
    effect(() => {
      const working = this.working();
      const text = this.workingText();
      untracked(() => {
        if (working) {
          this.announce(text);
        } else if (wasWorking) {
          this.afterRender(() => this.announceLastReply());
        }
        wasWorking = working;
      });
    });
  }

  /** Scrolls to the newest message and pins the thread there. */
  scrollToEnd(): void {
    this.pinned.set(true);
    this.unseen.set(0);
    this.toEnd();
  }

  protected onScroll(): void {
    const scroller = this.scroller().nativeElement;
    const atEnd =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <=
      PIN_TOLERANCE_PX;
    // Only the reader scrolling up unpins. The event for the thread's own scroll to the end can land
    // a frame after the content grew again, which reads as "away from the end" without anyone
    // scrolling up.
    const scrolledUp = scroller.scrollTop < this.lastScrollTop - 1;
    this.lastScrollTop = scroller.scrollTop;
    if (atEnd || scrolledUp) {
      this.pinned.set(atEnd);
    }
    if (atEnd) {
      this.unseen.set(0);
    }
    this.recordAnchor();
    if (
      scroller.scrollTop <= OLDER_THRESHOLD_PX &&
      this.hasOlder() &&
      !this.loadingOlder() &&
      !this.olderRequested
    ) {
      this.olderRequested = true;
      this.loadOlder.emit();
    }
  }

  private olderRequested = false;
  private lastScrollTop = 0;
  private anchor: { element: Element; top: number } | null = null;

  // The first message still in view, and how far below the top of the viewport it sits.
  private recordAnchor(): void {
    const scroller = this.scroller().nativeElement;
    const viewTop = scroller.getBoundingClientRect().top;
    const element = [
      ...this.content().nativeElement.querySelectorAll('ds-chat-message'),
    ].find((message) => message.getBoundingClientRect().bottom > viewTop);
    this.anchor = element
      ? { element, top: element.getBoundingClientRect().top - viewTop }
      : null;
  }

  // Content added or grown above the reader (older messages, an opened snapshot) pushes the message
  // they were reading down; scroll by the same amount so it stays where it was.
  private holdAnchor(): void {
    const anchor = this.anchor;
    if (!anchor?.element.isConnected) {
      return;
    }
    const scroller = this.scroller().nativeElement;
    const top =
      anchor.element.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top;
    scroller.scrollTop += top - anchor.top;
  }

  private onArrival(): void {
    if (this.messages().at(-1)?.role() === 'user') {
      // The reader just sent it: show it, wherever they had scrolled to.
      this.scrollToEnd();

      return;
    }
    if (!this.pinned()) {
      this.unseen.update((count) => count + 1);
    }
    if (!this.working() && !this.messages().at(-1)?.streaming()) {
      this.announceLastReply();
    }
  }

  private dividerText(sent: number): string {
    const date = new Date(sent);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const sameDay = (other: Date) =>
      date.toDateString() === other.toDateString();
    let day: string;
    if (sameDay(today)) {
      day = this.wording().today;
    } else if (sameDay(yesterday)) {
      day = this.wording().yesterday;
    } else {
      day = date.toLocaleDateString(this.locale, {
        day: 'numeric',
        month: 'short',
        year:
          date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
      });
    }
    const time = date.toLocaleTimeString(this.locale, {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${day} ${time}`;
  }

  // A user message that arrived folds the steps of every reply before it, except a reply whose failed
  // step the reader has not opened yet.
  private foldBefore(
    list: readonly ChatMessageComponent[],
    added: readonly ChatMessageComponent[],
  ): void {
    const sent = added.find((message) => message.role() === 'user');
    if (!sent) {
      return;
    }
    for (const reply of list.slice(0, list.indexOf(sent))) {
      if (
        reply.role() === 'assistant' &&
        reply.stepCount() > 0 &&
        reply.unopenedFailedStepCount() === 0
      ) {
        reply.stepsFolded.set(true);
      }
    }
  }

  private toEnd(): void {
    const scroller = this.scroller().nativeElement;
    scroller.scrollTop = scroller.scrollHeight;
  }

  private afterRender(read: () => void): void {
    afterNextRender({ read }, { injector: this.injector });
  }

  private announceLastReply(): void {
    if (this.messages().at(-1)?.role() !== 'assistant') {
      return;
    }
    const replies = this.host.nativeElement.querySelectorAll(
      'ds-chat-message[data-role="assistant"]',
    );
    const reply = replies[replies.length - 1];
    if (!reply) {
      return;
    }
    const speaker = reply.querySelector('.speaker')?.textContent?.trim() ?? '';
    const text = reply.querySelector('.bubble')?.textContent?.trim() ?? '';
    if (text) {
      this.announce(speaker ? `${speaker}: ${text}` : text);
    }
  }

  // Cleared first, so the same words twice in a row are still spoken.
  private announce(text: string): void {
    this.announcement.set('');
    this.afterRender(() => this.announcement.set(text));
  }
}
