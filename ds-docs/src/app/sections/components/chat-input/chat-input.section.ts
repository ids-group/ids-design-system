import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { ChatInputComponent } from 'ds/chat';
import type { ChatInputLayout } from 'ds/chat';
import { IconButtonComponent } from 'ds/icon-button';
import { SwitchComponent } from 'ds/switch';
import { TagComponent } from 'ds/tag';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-chat-input',
  standalone: true,
  imports: [
    DocsSectionComponent,
    ChatInputComponent,
    ButtonComponent,
    IconButtonComponent,
    SwitchComponent,
    TagComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './chat-input.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    './chat-input.section.scss',
  ],
})
export class ChatInputSection {
  protected readonly layouts: readonly ChatInputLayout[] = [
    'status-bar',
    'status-above',
    'split',
    'send-outside',
    'toolbar',
  ];
  protected readonly typed = signal('Make the header sticky on scroll');
  protected readonly chips = signal(['Header', 'Pricing card']);
  protected readonly studioText = signal('Use the brand blue for the button');

  protected readonly draft = signal('');
  protected readonly busy = signal(false);
  protected readonly pasted = signal<string[]>([]);
  protected readonly log = signal<string[]>([]);

  protected removeChip(name: string): void {
    this.chips.update((chips) => chips.filter((chip) => chip !== name));
  }

  protected send(text: string): void {
    this.log.update((log) => [...log, text]);
    this.draft.set('');
  }

  protected addPasted(files: File[]): void {
    this.pasted.update((names) => [
      ...names,
      ...files.map((file) => file.name || file.type),
    ]);
  }

  protected removePasted(name: string): void {
    this.pasted.update((names) => names.filter((entry) => entry !== name));
  }
}
