import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { MessageInputComponent } from 'ds/message-input';
import type { MessageInputLayout } from 'ds/message-input';
import { IconButtonComponent } from 'ds/icon-button';
import { SwitchComponent } from 'ds/switch';
import { TagComponent } from 'ds/tag';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-message-input',
  standalone: true,
  imports: [
    DocsSectionComponent,
    MessageInputComponent,
    ButtonComponent,
    IconButtonComponent,
    SwitchComponent,
    TagComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './message-input.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    './message-input.section.scss',
  ],
})
export class MessageInputSection {
  protected readonly layouts: readonly MessageInputLayout[] = [
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
