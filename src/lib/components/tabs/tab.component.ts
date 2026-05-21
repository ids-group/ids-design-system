import { Component, TemplateRef, ViewEncapsulation, input, viewChild } from '@angular/core';
import type { IconName } from '../../icons/icons.data';

@Component({
  selector: 'ds-tab',
  standalone: true,
  template: `<ng-template #content><ng-content></ng-content></ng-template>`,
  styles: [':host { display: none; }'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TabComponent {
  readonly label = input.required<string>();
  readonly icon = input<IconName | null>(null);
  readonly count = input<number | null>(null);
  readonly disabled = input<boolean>(false);
  readonly content = viewChild.required<TemplateRef<unknown>>('content');
}
