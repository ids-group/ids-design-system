import { Component } from '@angular/core';

/** Shared "panel is non-modal" dismissal note — one wording reused by every
 *  overlay-bearing section (selects, pickers, popover). */
@Component({
  selector: 'docs-nonmodal-note',
  standalone: true,
  template: `
    <p class="block-desc t-s">
      The panel is non-modal — the page stays interactive; click outside or
      scroll to dismiss.
    </p>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class DocsNonmodalNoteComponent {}
