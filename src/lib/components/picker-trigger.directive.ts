import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Replaces the CONTENTS of a picker's trigger (chips, value, placeholder) with your own
 * markup. The trigger ELEMENT stays library-owned: its ARIA attributes and
 * Enter/Space/ArrowDown/Escape handling are kept.
 *
 * ```html
 * <ds-multi-select [options]="labels()" [(value)]="picked">
 *   <ng-template dsPickerTrigger let-count="count">
 *     Labels @if (count) { <ds-badge [count]="count" /> }
 *   </ng-template>
 * </ds-multi-select>
 * ```
 *
 * Context: `$implicit` and `selected` are the selected options, `count` their
 * number, `open` whether the panel is showing, `disabled` the control's state.
 *
 * A projected template WINS over `triggerDisplay`, which is then not read at all.
 */
@Directive({
  selector: '[dsPickerTrigger]',
  standalone: true,
})
export class DsPickerTriggerDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
