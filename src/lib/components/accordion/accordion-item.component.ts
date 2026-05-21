import { Component, ViewEncapsulation, input, model } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'ds-accordion-item',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './accordion-item.component.html',
  styleUrl: './accordion-item.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class AccordionItemComponent {
  readonly title = input<string>('');
  readonly expanded = model<boolean>(false);

  protected toggle(): void {
    this.expanded.set(!this.expanded());
  }
}
