import { Component, signal } from '@angular/core';
import { ChatInputComponent } from 'ds/chat';

const params = new URLSearchParams(location.search);

@Component({
  selector: 'app-chat-input-placeholder-harness',
  imports: [ChatInputComponent],
  template: `
    <ds-chat-input
      style="display: block; width: 360px"
      [placeholder]="placeholder"
      [minRows]="minRows"
      [(value)]="text" />
  `,
})
export class ChatInputPlaceholderHarnessPage {
  protected readonly placeholder =
    params.get('placeholder') ??
    'Write anything: a question or a change for the whole screen, or pick something first to point at it.';
  protected readonly minRows = Number(params.get('rows') ?? 1);
  protected readonly text = signal(params.get('text') ?? '');
}
