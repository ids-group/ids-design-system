import { NgTemplateOutlet } from '@angular/common';
import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { COMPONENT_API } from './component-api.generated';
import type { ApiProp } from './component-api.types';

@Component({
  selector: 'docs-api-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './docs-api-table.component.html',
  styleUrl: './docs-api-table.component.scss',
})
export class DocsApiTableComponent {
  readonly key = input.required<string>();
  protected readonly data = computed(() => COMPONENT_API[this.key()] ?? null);
  protected readonly inputs = computed<readonly ApiProp[]>(
    () => this.data()?.inputs ?? [],
  );
  protected readonly outputs = computed<readonly ApiProp[]>(
    () => this.data()?.outputs ?? [],
  );
}
