import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  effect,
  inject,
  input,
  model,
} from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { ACCORDION, type AccordionItemRef } from './accordion.token';

let nextId = 0;

@Component({
  selector: 'ds-accordion-item',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './accordion-item.component.html',
  styleUrl: './accordion-item.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class AccordionItemComponent implements AccordionItemRef {
  /** Header text shown in the toggle button. */
  readonly title = input.required<string>();
  /** Open state, two-way bound. */
  readonly expanded = model<boolean>(false);
  /** Disables the toggle button; state stays as-is. */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly uid = `ds-accordion-${++nextId}`;
  protected readonly headId = `${this.uid}-head`;
  protected readonly bodyId = `${this.uid}-body`;

  private readonly accordion = inject(ACCORDION, { optional: true });

  /** Tracks last expanded state so we only notify on a true open transition. */
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

  /** Called by the accordion coordinator to enforce single-open mode. */
  closeItem(): void {
    this.expanded.set(false);
  }
}
