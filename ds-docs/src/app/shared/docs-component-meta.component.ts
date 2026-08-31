import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { COMPONENT_API } from './component-api.generated';

@Component({
  selector: 'docs-component-meta',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './docs-component-meta.component.html',
  styleUrl: './docs-component-meta.component.scss',
})
export class DocsComponentMetaComponent {
  readonly key = input.required<string>();
  protected readonly data = computed(() => COMPONENT_API[this.key()] ?? null);
}
