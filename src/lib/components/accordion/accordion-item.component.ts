import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
} from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import { ACCORDION, type AccordionItemRef } from './accordion.token';

let nextId = 0;

@Component({
  selector: 'ds-accordion-item',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './accordion-item.component.html',
  styleUrl: './accordion-item.component.scss',
  // A static `title="…"` also stays as the global attribute, giving the whole host a native tooltip.
  host: { '[attr.title]': 'null', '[class.chevron-down]': 'chevronDown()' },
  encapsulation: ViewEncapsulation.Emulated,
})
export class AccordionItemComponent implements AccordionItemRef {
  /** Header text shown in the toggle button. */
  readonly title = input.required<string>();
  /** Open state, two-way bound. */
  readonly expanded = model<boolean>(false);
  /** Disables the toggle; `expanded` is left as-is. */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly uid = `ds-accordion-${++nextId}`;
  protected readonly headId = `${this.uid}-head`;
  protected readonly bodyId = `${this.uid}-body`;

  private readonly accordion = inject(ACCORDION, { optional: true });

  protected readonly chevronDown = computed(
    () => (this.accordion?.chevron() ?? 'right') === 'down',
  );
  protected readonly chevronName = computed<IconName>(() =>
    this.chevronDown() ? 'chevronDown' : 'chevronRight',
  );

  private previousExpanded = false;

  constructor() {
    effect(() => {
      const isExpanded = this.expanded();
      if (isExpanded && !this.previousExpanded) {
        this.accordion?.notifyOpen(this);
      }
      this.previousExpanded = isExpanded;
    });
  }

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    this.expanded.set(!this.expanded());
  }

  closeItem(): void {
    this.expanded.set(false);
  }
}
