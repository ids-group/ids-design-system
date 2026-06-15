import { Component, ViewEncapsulation, input } from '@angular/core';
import { IconComponent } from 'ds';

@Component({
  selector: 'docs-await',
  standalone: true,
  imports: [IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <ds-icon name="clock" [size]="14" />
    {{ kind() === 'component' ? 'Ожидает компонент' : 'Ожидает API' }}: {{ name() }}
    <ng-content />
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1-5);
      padding: var(--space-1) var(--space-2-5);
      border: 1px dashed var(--warning);
      border-radius: var(--radius-pill);
      background: var(--warning-subtitle);
      color: var(--warning-text);
      font: var(--font-weight-bold) var(--font-size-xs)/var(--line-height-flat) var(--font-sans);
      letter-spacing: var(--letter-spacing-wide);
    }
  `],
})
export class DocsAwaitComponent {
  readonly kind = input<'component' | 'api'>('component');
  readonly name = input.required<string>();
}
