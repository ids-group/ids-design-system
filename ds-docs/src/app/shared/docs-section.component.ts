import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  SectionChaptersService,
  chapterSlug,
} from '../core/section-chapters.service';
import { COMPONENT_API, SERVICE_API } from './component-api.generated';
import { DocsComponentMetaComponent } from './docs-component-meta.component';
import { DocsApiTableComponent } from './docs-api-table.component';

/** Section wrapper shared by every docs section. Auto-renders the matching component's meta + Inputs/Outputs table when `anchor` hits a component-API key; `[api]="false"` opts out, `[apiKeys]` adds extras. */
@Component({
  selector: 'docs-section',
  standalone: true,
  imports: [DocsComponentMetaComponent, DocsApiTableComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './docs-section.component.html',
  styleUrl: './docs-section.component.scss',
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
  /** Service class names to append beyond the ones this section's own folder
   *  declares — for a service whose folder is no section's anchor. */
  readonly serviceKeys = input<readonly string[] | null>(null);

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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly chapters = inject(SectionChaptersService);

  constructor() {
    // After render, not from a lifecycle hook: the chapters are projected content, so they exist
    // only once this view has been stamped out.
    afterNextRender(() => {
      const anchor = this.anchor();
      const headings = Array.from(
        this.host.nativeElement.querySelectorAll<HTMLElement>('h3.block-title'),
      );
      const seen = new Set<string>();
      const found = headings.map((heading) => {
        const label = (heading.textContent ?? '').trim();
        let slug = chapterSlug(label);
        // Two chapters can reduce to one slug; the fragment has to stay unique to be navigable.
        if (seen.has(slug)) {
          let n = 2;
          while (seen.has(`${slug}-${n}`)) {
            n += 1;
          }
          slug = `${slug}-${n}`;
        }
        seen.add(slug);
        heading.id = slug;

        return { slug, label, heading };
      });
      this.chapters.publish(anchor, found);
    });
    inject(DestroyRef).onDestroy(() => this.chapters.withdraw(this.anchor()));
  }

  protected readonly serviceNames = computed(() => {
    if (!this.api()) {
      return [];
    }

    const anchor = this.anchor();
    const names = Object.values(SERVICE_API)
      .filter((service) => service.key === anchor)
      .map((service) => service.className);
    for (const name of this.serviceKeys() ?? []) {
      if (SERVICE_API[name] && !names.includes(name)) {
        names.push(name);
      }
    }

    return names;
  });
}
