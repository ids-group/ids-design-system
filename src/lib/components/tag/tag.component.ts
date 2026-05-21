import { Component, ViewEncapsulation, input, output } from '@angular/core';
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
    '[class.ghost]': "variant() === 'ghost'",
    '[class.closable]': 'closable()',
  },
})
export class TagComponent {
  readonly variant = input<TagVariant>('solid');
  readonly closable = input<boolean>(false);
  readonly closed = output<void>();
}
