import {
  Component,
  TemplateRef,
  ViewEncapsulation,
  contentChild,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/** Generic 1-axis showcase grid — projected `<ng-template let-item>` per value. Replaces the hand-rolled `.row`/`.cell` markup duplicated across badge/banner/tag/toast sections. */
@Component({
  selector: 'docs-specimens',
  standalone: true,
  imports: [NgTemplateOutlet],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <div class="specimens">
      @for (item of items(); track item) {
        <div class="specimen">
          <div class="stage">
            <ng-container
              [ngTemplateOutlet]="cell()"
              [ngTemplateOutletContext]="{ $implicit: item }"
            />
          </div>

          @if (showCaption()) {
            <code class="t-mono-inline caption">
              {{ item }}
            </code>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .specimens {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-5) var(--space-6);
        align-items: flex-end;
        margin-top: var(--space-3);
        padding: var(--space-5) var(--space-4);
        background: var(--surface-secondary);
        border-radius: var(--radius-lg);
      }
      .specimen {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        align-items: flex-start;
      }
      .stage {
        display: flex;
        align-items: center;
      }
      .caption {
        color: var(--text-tertiary);
      }
    `,
  ],
})
export class DocsSpecimensComponent {
  /** The values to showcase (one specimen each). */
  readonly items = input.required<readonly string[]>();
  /** Show the value as a caption under each specimen (default true). */
  readonly showCaption = input(true);

  protected readonly cell =
    contentChild.required<TemplateRef<unknown>>(TemplateRef);
}
