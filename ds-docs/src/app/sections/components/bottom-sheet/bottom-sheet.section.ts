import { Component, ViewEncapsulation, signal } from '@angular/core';
import { BottomSheetComponent, ButtonComponent } from 'ds';

@Component({
  selector: 'section-components-bottom-sheet',
  standalone: true,
  imports: [BottomSheetComponent, ButtonComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-bottom-sheet" data-anchor="bottom-sheet" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Bottom sheet</h2>
      <p class="lede t-m">
        Mobile-first panel anchored to the bottom edge — the touch equivalent of a drawer / modal.
        Drag the grab strip down or tap the scrim to dismiss; <kbd>Esc</kbd> also closes. Body scroll
        locks while open. On wider viewports it caps its width and centres.
      </p>

      <!-- ============================================================ Live demo -->
      <h3 class="block-title t-h4">Live demo</h3>
      <p class="block-desc t-s">
        Two-way <code class="t-mono">[(open)]</code> drives visibility; the <code class="t-mono">[actions]</code> slot holds footer buttons.
      </p>
      <div class="demo">
        <ds-button (pressed)="open.set(true)">Open bottom sheet</ds-button>
        <ds-bottom-sheet [(open)]="open" title="Edit registration" (closed)="open.set(false)">
          <p class="t-s sheet-body">
            Update the vehicle registration. Changes apply to the current event only.
          </p>
          <div actions>
            <ds-button variant="outline" (pressed)="open.set(false)">Cancel</ds-button>
            <ds-button (pressed)="open.set(false)">Save</ds-button>
          </div>
        </ds-bottom-sheet>
      </div>

      <!-- ============================================================ Anatomy -->
      <h3 class="block-title t-h4">Anatomy</h3>
      <ul class="rules">
        <li><strong>Grab strip</strong> — draggable handle at the top; drag down past threshold to dismiss.</li>
        <li><strong>Title</strong> — optional, via <code class="t-mono">[title]</code>.</li>
        <li><strong>Body</strong> — default <code class="t-mono">&lt;ng-content&gt;</code>; scrolls if taller than the sheet.</li>
        <li><strong>Actions</strong> — <code class="t-mono">[actions]</code> slot, pinned footer.</li>
        <li><strong>Dismiss</strong> — scrim tap, <kbd>Esc</kbd>, drag-down, or setting <code class="t-mono">open=false</code>; each emits <code class="t-mono">(closed)</code>.</li>
      </ul>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); max-width: var(--col-cap-text); }

    .demo {
      margin-top: var(--s-3);
      padding: var(--s-5);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
    }
    .sheet-body { color: var(--text-secondary); margin: 0; }

    .rules {
      margin-top: var(--s-3);
      padding-left: var(--s-5);
      color: var(--text-secondary);
      display: grid;
      gap: var(--s-2);
      max-width: var(--col-cap-text);
    }
    code.t-mono {
      font: var(--fw-regular) var(--fs-mono)/1 var(--font-mono);
      background: var(--surface-secondary);
      padding: 1px var(--s-1);
      border-radius: var(--r-sm);
      color: var(--text-primary);
    }
    kbd {
      display: inline-block;
      padding: 1px 6px;
      font: var(--fw-medium) 11px/1 var(--font-mono);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-default);
      border-radius: var(--r-sm);
      color: var(--text-secondary);
    }
  `],
})
export class BottomSheetSection {
  protected readonly open = signal(false);
}
