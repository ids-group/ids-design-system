import { Component, ViewEncapsulation, input } from '@angular/core';
import { IconComponent } from 'ds';

/** Inline yellow "i" marking a by-design raw specimen that waits on a missing
 *  component or API. Hover/focus reveals what it's waiting for. Sits where the
 *  raw markup is — distinct from the neutral truncation "i" at the section title. */
@Component({
  selector: 'docs-await',
  standalone: true,
  imports: [IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <button type="button" class="mark" [attr.aria-label]="text()">
      <ds-icon name="info" [size]="15" />
    </button>
    <span class="pop" role="tooltip">{{ text() }}</span>
  `,
  styles: [`
    :host { position: relative; display: inline-flex; vertical-align: middle; }
    .mark {
      display: inline-flex; padding: 0; border: 0; background: none;
      color: var(--warning-text); cursor: help; border-radius: var(--radius-pill);
    }
    .mark:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }
    .pop {
      position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
      z-index: var(--layer-tooltip, 100); white-space: nowrap;
      background: var(--warning-text); color: var(--surface-default, #fff);
      padding: var(--space-1) var(--space-2-5); border-radius: var(--radius-md);
      font: var(--font-weight-bold) var(--font-size-xs)/var(--line-height-flat) var(--font-sans);
      letter-spacing: var(--letter-spacing-wide);
      opacity: 0; pointer-events: none; transition: opacity 120ms;
    }
    :host:hover .pop, .mark:focus-visible + .pop { opacity: 1; }
  `],
})
export class DocsAwaitComponent {
  readonly kind = input<'component' | 'api'>('component');
  readonly name = input.required<string>();

  protected text(): string {
    return `${this.kind() === 'component' ? 'Ожидает компонент' : 'Ожидает API'}: ${this.name()}`;
  }
}
