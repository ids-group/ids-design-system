import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Replaces the CONTENTS of a picker's trigger — the chips, the value, the
 * placeholder — with your own markup. The trigger ELEMENT stays library-owned,
 * so `aria-haspopup`, `aria-expanded`, `aria-controls`, the roving
 * `aria-activedescendant` and the Enter/Space/ArrowDown/Escape handling cannot
 * be lost with it.
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
 * A projected template WINS over `triggerDisplay` — that input is then not read
 * at all, so there is no "compact plus a template" combination to explain.
 */
@Directive({
  selector: '[dsPickerTrigger]',
  standalone: true,
})
export class DsPickerTriggerDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
