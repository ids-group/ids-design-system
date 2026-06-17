import { Component, ViewEncapsulation, input } from '@angular/core';

/** Section shell shared by every docs section. Owns the `<section>` (with the
 *  `data-anchor`/`id` the sidebar scroll-spy relies on), the eyebrow, the title
 *  and the lede — so that scaffold isn't copy-pasted into ~60 sections.
 *
 *  Usage:
 *    <docs-section anchor="button" eyebrow="Components" title="Buttons">
 *      <docs-truncation [rules]="truncationRules" />   <!-- optional, lands in the title -->
 *      <span lede>Lede text, may contain <code>inline</code> markup.</span>
 *      ...body blocks...
 *    </docs-section>
 */
@Component({
  selector: 'docs-section',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section
      class="section"
      [id]="'section-' + anchor()"
      [attr.data-anchor]="anchor()"
    >
      <div class="eyebrow t-overline">
        {{ eyebrow() }}
      </div>

      <h2 class="t-h2">
        {{ title() }}<ng-content select="docs-truncation" />
      </h2>

      <p class="lede t-m">
        <ng-content select="[lede]" />
      </p>

      <ng-content />
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .section {
        scroll-margin-top: calc(var(--topbar-h) + var(--space-4));
      }
      .eyebrow {
        color: var(--primary);
        margin-bottom: var(--space-2);
      }
      .lede {
        color: var(--text-secondary);
        margin-top: var(--space-2);
        max-width: var(--col-cap-text);
      }
      /* Body scaffolding (projected content) — shared block heading/description. */
      :host ::ng-deep .block-title {
        margin-top: var(--space-8);
      }
      :host ::ng-deep .block-desc {
        color: var(--text-secondary);
        margin-top: var(--space-1);
        max-width: var(--col-cap-text);
      }
    `,
  ],
})
export class DocsSectionComponent {
  readonly anchor = input.required<string>();
  readonly eyebrow = input<string>('');
  readonly title = input.required<string>();
}
