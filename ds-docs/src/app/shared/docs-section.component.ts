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

/** Section shell shared by every docs section. Auto-renders the matching component's meta + Inputs/Outputs table when `anchor` hits a component-API key; `[api]="false"` opts out, `[apiKeys]` adds extras. */
@Component({
  selector: 'docs-section',
  standalone: true,
  imports: [DocsComponentMetaComponent, DocsApiTableComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './docs-section.component.html',
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
  /** Extra component-API keys to append as their own blocks — for sub-components
   *  that live in a sibling folder and are documented inside this section (e.g.
   *  the Button section adds `button-group`, `toggle-button`; layout-primitives
   *  adds the whole `layout` family). The anchor's own component stays primary. */
  readonly apiKeys = input<readonly string[] | null>(null);

  /** The anchor's own component, shown under the title + as the first table. */
  protected readonly primaryKey = computed(() => {
    if (!this.api()) {
      return null;
    }

    return COMPONENT_API[this.anchor()] ? this.anchor() : null;
  });

  /** Same-folder secondaries (`<anchor>:*`) plus the explicit `apiKeys` extras,
   *  each rendered as its own meta + table block after the primary table. */
  protected readonly secondaryKeys = computed(() => {
    if (!this.api()) {
      return [];
    }

    const anchor = this.anchor();
    const primary = this.primaryKey();
    const keys = Object.keys(COMPONENT_API).filter((key) =>
      key.startsWith(`${anchor}:`),
    );
    for (const key of this.apiKeys() ?? []) {
      if (COMPONENT_API[key] && key !== primary && !keys.includes(key)) {
        keys.push(key);
      }
    }

    return keys;
  });
}
