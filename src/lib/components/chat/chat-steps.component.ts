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
}
