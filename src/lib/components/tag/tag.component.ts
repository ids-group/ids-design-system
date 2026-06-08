import { Component, ViewEncapsulation, booleanAttribute, input, output } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { TagVariant } from './tag.types';

@Component({
  selector: 'ds-tag',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.neutral]': "variant() === 'neutral'",
    '[class.closable]': 'closable()',
    '[class.interactive]': 'interactive()',
    '[class.is-active]': 'selected()',
    '(click)': 'onClick()',
  },
})
export class TagComponent {
  readonly variant = input<TagVariant>('solid');
  readonly closable = input<boolean>(false);
  readonly interactive = input(false, { transform: booleanAttribute });
  readonly selected = input(false, { transform: booleanAttribute });
  readonly closed = output<void>();
  readonly toggled = output<void>();

  protected onClick(): void {
    if (this.interactive()) this.toggled.emit();
  }
}
