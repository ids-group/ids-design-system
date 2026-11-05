import { Component, signal } from '@angular/core';
import { ChatInputComponent } from 'ds/chat';

@Component({
  selector: 'app-chat-input-placeholder-harness',
  imports: [ChatInputComponent],
  template: `
    <ds-chat-input
      style="display: block; width: 360px"
      placeholder="Write anything: a question or a change for the whole screen, or pick something first to point at it."
      [(value)]="text" />
  `,
})
export class ChatInputPlaceholderHarnessPage {
  protected readonly text = signal('');
}
