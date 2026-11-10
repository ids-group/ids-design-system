import { Component, signal } from '@angular/core';
import { ChatInputComponent } from 'ds/chat';

@Component({
  selector: 'app-chat-input-busy-action-harness',
  imports: [ChatInputComponent],
  template: `
    <ds-chat-input
      style="display: block; width: 480px"
      busyAction="queue"
      busy
      stoppable
      [(value)]="text"
      (queued)="events.set(events() + 'queued:' + $event + ';')"
      (redirected)="events.set(events() + 'redirected:' + $event + ';')"
      (stopRequested)="events.set(events() + 'stop;')"
      (submitted)="events.set(events() + 'submitted;')" />

    <output id="events">
      {{ events() }}
    </output>
  `,
})
export class ChatInputBusyActionHarnessPage {
  protected readonly text = signal('');
  protected readonly events = signal('');
}
