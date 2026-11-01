import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { ComposerComponent } from 'ds/composer';
import type { ComposerLayout } from 'ds/composer';
import { IconButtonComponent } from 'ds/icon-button';
import { SwitchComponent } from 'ds/switch';
import { TagComponent } from 'ds/tag';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-composer',
  standalone: true,
  imports: [
    DocsSectionComponent,
    ComposerComponent,
    ButtonComponent,
    IconButtonComponent,
    SwitchComponent,
    TagComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './composer.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './composer.section.scss'],
})
export class ComposerSection {
  protected readonly layouts: readonly ComposerLayout[] = [
    'status-bar',
    'status-above',
    'labelled',
    'outside',
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
