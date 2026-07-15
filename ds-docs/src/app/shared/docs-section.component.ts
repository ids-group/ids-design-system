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
 *  off) the shell AUTO-renders that component's meta-header under the title and
 *  its Inputs/Outputs table at the end. Secondary components living in the same
 *  lib folder (keyed `<anchor>:<ClassName>`, e.g. `ds-accordion-item`) are
 *  appended as their own meta + table blocks — so a section documents its whole
 *  component family for free. Set `[api]="false"` to opt out (e.g. a foundation
 *  whose anchor collides with a component key), or pass `[apiKeys]` to render an
 *  explicit set when the anchor doesn't match the folder (e.g. layout-primitives
 *  → the `layout` family).
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

      @if (primaryKey(); as pk) {
        <docs-component-meta [key]="pk" />
      }

      <p class="lede t-m">
        <ng-content select="[lede]" />
      </p>

      <ng-content />

      @if (primaryKey(); as pk) {
        <docs-api-table [key]="pk" />
      }

      @for (key of secondaryKeys(); track key) {
        <div class="api-sub">
          <docs-component-meta [key]="key" />

          <docs-api-table [key]="key" />
        </div>
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
      /* Secondary same-family component: its own meta + API table block. */
      .api-sub {
        margin-top: var(--space-8);
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
  /** Explicit component-API keys to render when the anchor doesn't match the
   *  lib folder (e.g. `layout-primitives` → the `layout` family). Each renders
   *  as its own meta + table block; nothing is shown under the title. */
  readonly apiKeys = input<readonly string[] | null>(null);

  /** [anchor, ...same-folder secondaries] present in the generated API. */
  private readonly derivedKeys = computed(() => {
    const anchor = this.anchor();
    const keys = COMPONENT_API[anchor] ? [anchor] : [];
    for (const key of Object.keys(COMPONENT_API)) {
      if (key.startsWith(`${anchor}:`)) {
        keys.push(key);
      }
    }

    return keys;
  });

  private readonly explicitKeys = computed(() =>
    (this.apiKeys() ?? []).filter((key) => !!COMPONENT_API[key]),
  );

  /** Primary component shown under the title + as the first table. Null in the
   *  explicit-keys case, where the title heads a family, not one component. */
  protected readonly primaryKey = computed(() => {
    if (!this.api() || this.apiKeys()) {
      return null;
    }

    return this.derivedKeys()[0] ?? null;
  });

  /** Secondary component blocks appended after the primary table. */
  protected readonly secondaryKeys = computed(() => {
    if (!this.api()) {
      return [];
    }

    return this.apiKeys() ? this.explicitKeys() : this.derivedKeys().slice(1);
  });
}
