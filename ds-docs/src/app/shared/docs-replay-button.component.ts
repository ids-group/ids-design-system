import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { replayMarks } from './replay-marks';

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
  private readonly host = inject(ElementRef<HTMLElement>);

  protected replay(): void {
    replayMarks(this.host.nativeElement);
  }
}
