import { Component, ViewEncapsulation, signal, viewChild } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { TextareaComponent } from 'ds/textarea';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-textarea',
  standalone: true,
  imports: [DocsSectionComponent, TextareaComponent, ButtonComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './textarea.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './textarea.section.scss'],
})
export class TextareaSection {
  private readonly editor = viewChild.required<TextareaComponent>('editor');
  protected readonly draft = signal(
    'Dear customer, your policy renewal is due on 1 October.',
  );
  protected readonly selectionReadout = signal('not read yet');
  protected readonly softNote = signal(
    'Called the customer about the renewal. They asked for the quote to be resent to the new address, and for a call back next week once the broker has confirmed the excess.',
  );

  protected readonly trimmedNote = signal('Quote resent to the new address.        ');

  protected selectRenewal(): void {
    const start = this.draft().indexOf('policy renewal');
    const field = this.editor();
    field.focus();
    field.setSelectionRange(start, start + 'policy renewal'.length);
    this.readSelection();
  }

  protected selectAll(): void {
    const field = this.editor();
    field.focus();
    field.select();
    this.readSelection();
  }

  protected readSelection(): void {
    const field = this.editor();
    this.selectionReadout.set(`${field.selectionStart}-${field.selectionEnd}`);
  }
}
