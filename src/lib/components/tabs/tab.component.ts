import {
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  input,
  viewChild,
} from '@angular/core';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';

@Component({
  selector: 'ds-tab',
  standalone: true,
  template: `<ng-template #content>
    <ng-content></ng-content>
  </ng-template>`,
  styles: [':host { display: none; }'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TabComponent {
  /** Text shown in the tab button. */
  readonly label = input.required<string>();
  /** Icon shown before the label. */
  readonly icon = input<IconName | null>(null);
  /** Numeric badge shown after the label. */
  readonly count = input<number | null>(null);
  /** Excludes the tab from selection and keyboard navigation. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Identifier emitted by tabClosed. Falls back to label when omitted. */
  readonly value = input<string | null>(null);
  readonly content = viewChild.required<TemplateRef<unknown>>('content');
}
