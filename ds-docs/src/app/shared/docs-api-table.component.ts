import { NgTemplateOutlet } from '@angular/common';
import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { COMPONENT_API, SERVICE_API } from './component-api.generated';
import type { ApiMember, ApiProp } from './component-api.types';

@Component({
  selector: 'docs-api-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './docs-api-table.component.html',
  styleUrl: './docs-api-table.component.scss',
})
export class DocsApiTableComponent {
  readonly key = input<string | null>(null);
  /** A service has no selector, so it is addressed by class name rather than by
   *  folder key. Set alongside `key` on a section that documents both. */
  readonly service = input<string | null>(null);

  protected readonly data = computed(() => {
    const key = this.key();

    return key ? (COMPONENT_API[key] ?? null) : null;
  });
  protected readonly serviceData = computed(() => {
    const name = this.service();

    return name ? (SERVICE_API[name] ?? null) : null;
  });

  protected readonly inputs = computed<readonly ApiProp[]>(
    () => this.data()?.inputs ?? [],
  );
  protected readonly outputs = computed<readonly ApiProp[]>(
    () => this.data()?.outputs ?? [],
  );
  protected readonly methods = computed<readonly ApiMember[]>(
    () => this.serviceData()?.members.filter((m) => m.kind === 'method') ?? [],
  );
  protected readonly properties = computed<readonly ApiMember[]>(
    () =>
      this.serviceData()?.members.filter((m) => m.kind === 'property') ?? [],
  );

  protected readonly missing = computed(
    () => !this.data() && !this.serviceData(),
  );
  protected readonly missingName = computed(
    () => this.service() ?? this.key() ?? '',
  );
}
