import { Component, signal } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { ChatInputComponent } from 'ds/chat';

@Component({
  selector: 'app-chat-input-busy-action-harness',
  imports: [ButtonComponent, ChatInputComponent],
  template: `
    <ds-chat-input
      style="display: block; width: 480px"
      busyAction="queue"
      busy
      stoppable
      [(value)]="text"
      (queued)="events.set(events() + 'queued:' + $event + ';')"
      (stopRequested)="events.set(events() + 'stop;')"
      (submitted)="events.set(events() + 'submitted;')">
      <ds-button
        busyActions
        size="sm"
        variant="ghost">
        Redirect now
      </ds-button>
    </ds-chat-input>
    <output id="events">{{ events() }}</output>
  `,
})
export class ChatInputBusyActionHarnessPage {
  protected readonly text = signal('');
  protected readonly events = signal('');
}
