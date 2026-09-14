import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { replayMarks } from './replay-marks';

/**
 * Replays a specimen's enter animation. The data editors carry one of these in their own row; this
 * is for a card that has no editor, so every specimen on the page can be watched arriving.
 */
@Component({
  selector: 'docs-replay-button',
  standalone: true,
  template: `<button class="replay" type="button" (click)="replay()">
    Replay animation
  </button>`,
  styleUrl: './docs-replay-button.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsReplayButtonComponent {
  /** The signals holding the specimen's marks. Emptied and restored together, so a card showing
   *  two charts replays both at once rather than one after the other. */
  readonly data = input.required<WritableSignal<readonly unknown[]>[]>();

  protected replay(): void {
    replayMarks(...this.data());
  }
}
