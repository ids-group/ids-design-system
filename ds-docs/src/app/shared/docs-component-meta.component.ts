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
  template: `
    @let api = data();

    @if (api) {
      <div class="meta">
        <div class="row">
          <span class="chip tagchip">
            <span class="k">
              {{ api.isElement ? 'tag' : 'attr' }}
            </span>

            <span class="tag">
              {{ api.isElement ? '<' + api.selector + '>' : api.selector }}
            </span>
          </span>

          <span class="chip">
            <span class="k"> class </span>{{ api.className }}
          </span>

          <span class="badge" [class]="api.status">
            {{ api.status }}
          </span>
        </div>

        @if (api.summary) {
          <p class="summary">{{ api.summary }}</p>
        }

        <div class="importbar">
          <code class="imp">
            import {{ '{' }} {{ api.importName }} {{ '}' }} from '{{
              api.importPath
            }}';
          </code>

          <button
            type="button"
            class="copy"
            (click)="copy(api.importName, api.importPath)"
          >
            {{ copied() ? 'Copied ✓' : 'Copy' }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        margin-top: var(--space-4);
      }
      .meta {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
        align-items: center;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        font-family: var(--font-mono);
        font-size: var(--font-size-s);
        font-weight: var(--font-weight-semibold);
        background: var(--surface-secondary);
        border: var(--border-width-default) solid var(--border-default);
        border-radius: var(--radius-sm);
        padding: 5px 10px;
      }
      .chip.tagchip {
        border-color: var(--primary);
      }
      .chip .tag {
        color: var(--primary);
        font-weight: var(--font-weight-semibold);
      }
      .chip .k {
        color: var(--text-tertiary);
        font-family: var(--font-sans);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wider);
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        padding: 4px 10px;
        border-radius: var(--radius-pill);
        text-transform: capitalize;
      }
      .badge::before {
        content: '';
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
      }
      .badge.stable {
        color: var(--success);
        background: var(--surface-muted);
      }
      .badge.new {
        color: var(--primary);
        background: var(--surface-muted);
      }
      .badge.deprecated {
        color: var(--error);
        background: var(--surface-muted);
      }
      .summary {
        color: var(--text-secondary);
        margin: 0;
      }
      .importbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
        background: var(--surface-muted);
        border: var(--border-width-default) solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-2) var(--space-3);
        overflow-x: auto;
      }
      .imp {
        font-family: var(--font-mono);
        font-size: var(--font-size-s);
        white-space: nowrap;
      }
      .copy {
        flex: none;
        border: var(--border-width-default) solid var(--border-default);
        background: var(--surface-secondary);
        color: var(--text-secondary);
        border-radius: var(--radius-sm);
        padding: 5px 10px;
        font: inherit;
        font-size: var(--font-size-xs);
        cursor: pointer;
      }
      .copy:hover {
        color: var(--text-primary);
      }
    `,
  ],
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
