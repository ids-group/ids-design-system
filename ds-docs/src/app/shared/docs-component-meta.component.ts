import {
  Component,
  ViewEncapsulation,
  computed,
  input,
  signal,
} from '@angular/core';
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
  protected readonly copied = signal(false);

  protected copy(name: string, path: string): void {
    void navigator.clipboard?.writeText(`import { ${name} } from '${path}';`);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1200);
  }
}
