import {
  Component,
  ViewEncapsulation,
  computed,
  contentChildren,
  forwardRef,
  input,
} from '@angular/core';
import { CHAT_STEPS } from './chat.token';
import type { ChatStepsEnter } from './chat.types';
import { ChatStepComponent } from './chat-step.component';

/**
 * The steps of an agent's work, in the `[steps]` slot of a `ds-chat-message`: `ds-chat-step`s in
 * order. The message folds them into a chip on its bubble and grows new steps in.
 */
@Component({
  selector: 'ds-chat-steps',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrl: './chat-steps.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'list',
    // The compact density tokens apply to whatever the steps hold.
    'data-density': 'compact',
  },
  providers: [
    {
      provide: CHAT_STEPS,
      useExisting: forwardRef(() => ChatStepsComponent),
    },
  ],
})
export class ChatStepsComponent {
  /** How steps that arrive together (a plan given at once) come in: `'together'` grows them in as
   *  one block, `'stagger'` one after another. Steps that arrive one at a time grow in either way. */
  readonly enter = input<ChatStepsEnter>('together');

  // Descendants, so a step inside a wrapper element or an @for block still counts.
  private readonly items = contentChildren(ChatStepComponent, {
    descendants: true,
  });

  /** The step that draws no gap above it. */
  readonly firstStep = computed<object | undefined>(() => this.items().at(0));

  /** The step that draws no gap below it. */
  readonly lastStep = computed<object | undefined>(() => this.items().at(-1));

  /** Shortest time a step shows as running before its final status, even when it finishes at once;
   *  `0` shows the final status at once. */
  readonly minRunningMs = input(600);
  /** Shortest gap between two steps showing their final status, so steps that finish together
   *  settle one after another; `0` lets them settle together. */
  readonly revealStaggerMs = input(300);

  private lastSettle = 0;

  /** @internal */
  settleDelay(runningSince: number): number {
    if (
      typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return 0;
    }
    const now = performance.now();
    const at = Math.max(
      now,
      runningSince + this.minRunningMs(),
      this.lastSettle + this.revealStaggerMs(),
    );
    this.lastSettle = at;

    return at - now;
  }
}
