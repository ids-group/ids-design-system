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
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  DS_INTL,
  DS_INTL_DEFAULTS,
} from '@ids-group-ltd/ids-design-system/core';
import { ButtonComponent } from '@ids-group-ltd/ids-design-system/components/button';
import { SpinnerComponent } from '@ids-group-ltd/ids-design-system/components/spinner';
import { CHAT_THREAD } from './chat.token';
import { ChatMessageComponent } from './chat-message.component';

// Closer to the end than this still counts as at the end, so a sub-pixel scroll position or a
// small nudge does not unpin the thread.
const PIN_TOLERANCE_PX = 32;

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

  // Descendants, so a message inside a wrapper element or an @for block still counts.
  private readonly messages = contentChildren(ChatMessageComponent, {
    descendants: true,
  });

  /** The first message, which takes no space above it. */
  readonly firstMessage = computed<object | undefined>(() =>
    this.messages().at(0),
  );

  /** Messages that follow one of the same role. */
  readonly groupedMessages = computed<ReadonlySet<object>>(() => {
    const list = this.messages();

    return new Set(
      list.filter(
        (message, i) => i > 0 && message.role() === list[i - 1].role(),
      ),
    );
  });

  private readonly intl = inject(DS_INTL);
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

  protected readonly pinned = signal(true);
  protected readonly unseen = signal(false);
  protected readonly announcement = signal('');
  protected readonly jumpLabel = computed(() =>
    this.unseen() ? this.wording().newMessages : this.wording().latest,
  );

  constructor() {
    afterNextRender(() => {
      this.toEnd();
      // Growth of the content (a new message, a streamed line, an opened snapshot) and a smaller
      // viewport both move the end away; a pinned thread follows it.
      const observer = new ResizeObserver(() => {
        if (this.pinned()) {
          this.toEnd();
        }
      });
      observer.observe(this.content().nativeElement);
      observer.observe(this.scroller().nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });

    // The messages present at the first render, or the first batch to arrive into an empty
    // thread, are history: they are scrolled to, never announced.
    let seen = -1;
    effect(() => {
      const list = this.messages();
      untracked(() => {
        const previous = seen;
        seen = list.length;
        if (previous > 0 && list.length > previous) {
          // After the render: a message created in this pass has not read its `role` input yet.
          this.afterRender(() => this.onArrival());
        }
      });
    });

    let wasWorking = false;
    effect(() => {
      const working = this.working();
      const text = this.workingText();
      untracked(() => {
        if (working) {
          this.announce(text);
          if (!wasWorking && !this.pinned()) {
            this.unseen.set(true);
          }
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
    this.unseen.set(false);
    this.toEnd();
  }

  protected onScroll(): void {
    const scroller = this.scroller().nativeElement;
    const atEnd =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <=
      PIN_TOLERANCE_PX;
    this.pinned.set(atEnd);
    if (atEnd) {
      this.unseen.set(false);
    }
  }

  private onArrival(): void {
    if (this.messages().at(-1)?.role() === 'user') {
      // The reader just sent it: show it, wherever they had scrolled to.
      this.scrollToEnd();

      return;
    }
    if (!this.pinned()) {
      this.unseen.set(true);
    }
    if (!this.working()) {
      this.announceLastReply();
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
