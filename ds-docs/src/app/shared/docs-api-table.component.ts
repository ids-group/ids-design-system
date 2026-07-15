import { NgTemplateOutlet } from '@angular/common';
import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { COMPONENT_API } from './component-api.generated';
import type { ApiProp } from './component-api.types';

@Component({
  selector: 'docs-api-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    @let api = data();

    @if (api) {
      @if (inputs().length) {
        <details class="api">
          <summary>
            Inputs <span class="count">{{ inputs().length }}</span>
          </summary>

          <div class="scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>

                  <th>Type</th>

                  <th>Default</th>

                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                @for (p of inputs(); track p.name) {
                  <tr>
                    <td>
                      <span class="pname">
                        {{ p.name }}
                      </span>

                      @if (p.required) {
                        <span class="req" title="required">*</span>
                      }

                      @if (p.kind === 'model') {
                        <span class="tag">two-way</span>
                      }
                    </td>

                    <td>
                      <ng-container
                        [ngTemplateOutlet]="typeCell"
                        [ngTemplateOutletContext]="{ $implicit: p }"
                      />
                    </td>

                    <td>
                      @if (p.default === null || p.default === 'null') {
                        <span class="muted">
                          {{ p.default ?? '—' }}
                        </span>
                      } @else {
                        <code class="mono">
                          {{ p.default }}
                        </code>
                      }
                    </td>

                    <td>
                      @if (p.description) {
                        <span class="desc">{{ p.description }}</span>
                      } @else {
                        <span class="desc missing">— needs description —</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </details>
      }

      @if (outputs().length) {
        <details class="api">
          <summary>
            Outputs <span class="count">{{ outputs().length }}</span>
          </summary>

          <div class="scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>

                  <th>Type</th>

                  <th>Emits</th>

                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                @for (p of outputs(); track p.name) {
                  <tr>
                    <td>
                      <span class="pname">
                        {{ p.name }}
                      </span>
                    </td>

                    <td>
                      <code class="mono">
                        {{ p.type }}
                      </code>
                    </td>

                    <td>
                      <span class="muted"> event </span>
                    </td>

                    <td>
                      @if (p.description) {
                        <span class="desc">{{ p.description }}</span>
                      } @else {
                        <span class="desc missing">— needs description —</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </details>
      }
    } @else {
      <p class="unknown">No API metadata for key "{{ key() }}".</p>
    }

    <ng-template #typeCell let-p>
      @if (p.union) {
        <span class="uni">
          @for (v of p.union; track v) {
            <code class="mono chip">{{ v }}</code>
          }
        </span>
      } @else {
        <code class="mono type">
          {{ p.type }}
        </code>
      }
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        margin-top: var(--space-6);
      }
      details.api {
        border: var(--border-width-default) solid var(--border-default);
        border-radius: var(--radius-md);
        background: var(--surface-secondary);
        overflow: hidden;
        margin-bottom: var(--space-4);
      }
      summary {
        list-style: none;
        cursor: pointer;
        padding: var(--space-3) var(--space-4);
        font-weight: var(--font-weight-bold);
        display: flex;
        align-items: center;
        gap: var(--space-2);
        user-select: none;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      summary::before {
        content: '▸';
        color: var(--text-tertiary);
        transition: transform var(--duration-fast) var(--ease-standard);
      }
      details[open] > summary::before {
        transform: rotate(90deg);
      }
      .count {
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-bold);
        color: var(--text-tertiary);
        background: var(--surface-muted);
        border-radius: var(--radius-pill);
        padding: 1px 8px;
      }
      .scroll {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--font-size-s);
        background: var(--surface-default);
      }
      thead th {
        text-align: left;
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-bold);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wider);
        color: var(--text-tertiary);
        padding: var(--space-2) var(--space-4);
        background: var(--surface-muted);
        border-block: var(--border-width-default) solid var(--border-default);
      }
      tbody td {
        padding: var(--space-3) var(--space-4);
        border-bottom: var(--border-width-default) solid var(--border-divider);
        vertical-align: top;
      }
      tbody tr:last-child td {
        border-bottom: 0;
      }
      .pname {
        font-family: var(--font-mono);
        font-weight: var(--font-weight-semibold);
      }
      .req {
        color: var(--error);
        font-weight: var(--font-weight-bold);
        margin-left: 2px;
      }
      .tag {
        font-size: 10px;
        font-weight: var(--font-weight-bold);
        color: var(--primary);
        background: var(--surface-muted);
        border-radius: var(--radius-sm);
        padding: 1px 5px;
        margin-left: 6px;
        vertical-align: middle;
      }
      .mono {
        font-family: var(--font-mono);
        font-size: var(--font-size-xs);
      }
      .uni {
        display: inline-flex;
        flex-wrap: wrap;
        gap: var(--space-1);
      }
      .chip {
        background: var(--surface-muted);
        border-radius: var(--radius-sm);
        padding: 1px 6px;
      }
      .muted {
        color: var(--text-tertiary);
        font-style: italic;
      }
      .desc {
        color: var(--text-secondary);
      }
      .desc.missing {
        color: var(--warning);
        font-style: italic;
      }
      .unknown {
        color: var(--warning);
        font-family: var(--font-mono);
        font-size: var(--font-size-s);
      }
    `,
  ],
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
