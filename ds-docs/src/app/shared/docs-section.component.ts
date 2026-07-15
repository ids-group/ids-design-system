import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { COMPONENT_API } from './component-api.generated';
import { DocsComponentMetaComponent } from './docs-component-meta.component';
import { DocsApiTableComponent } from './docs-api-table.component';

/** Section shell shared by every docs section. Owns the `<section>` (with the
 *  `data-anchor`/`id` the sidebar scroll-spy relies on), the eyebrow, the title
 *  and the lede — so that scaffold isn't copy-pasted into ~60 sections.
 *
 *  When `anchor` matches a generated component-API key (and `api` isn't turned
 *  off) the shell AUTO-renders the component meta-header under the title and the
 *  Inputs/Outputs table at the end — so component sections get their API surface
 *  for free, no per-section wiring. Set `[api]="false"` to opt out (e.g. a
 *  foundation whose anchor collides with a component key).
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
  imports: [DocsComponentMetaComponent, DocsApiTableComponent],
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

      @if (hasApi()) {
        <docs-component-meta [key]="anchor()" />
      }

      <p class="lede t-m">
        <ng-content select="[lede]" />
      </p>

      <ng-content />

      @if (hasApi()) {
        <docs-api-table [key]="anchor()" />
      }
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
  /** Opt out of the auto API surface — for a non-component section whose anchor
   *  collides with a component key (e.g. the Layout foundation vs `layout`). */
  readonly api = input(true, { transform: booleanAttribute });

  protected readonly hasApi = computed(
    () => this.api() && !!COMPONENT_API[this.anchor()],
  );
}
