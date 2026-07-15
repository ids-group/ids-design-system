import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import { DescriptionListComponent } from './description-list.component';

@Component({
  selector: 'ds-description-item',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './description-item.component.html',
  styleUrl: './description-item.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'group',
    '[class.stacked]': 'stacked()',
  },
})
export class DescriptionItemComponent {
  private readonly list = inject(DescriptionListComponent, { optional: true });

  /** The label. Plain text; rich values go in the projected content. */
  readonly term = input<string>('');
  /** When set, a copy button appears that copies this string to the clipboard. */
  readonly copyValue = input<string | null>(null);

  protected readonly stacked = computed(
    () => this.list?.orientation() === 'stacked',
  );
  protected readonly copied = signal(false);

  protected async copy(): Promise<void> {
    const value = this.copyValue();
    if (!value) {
      return;
    }
    await navigator.clipboard?.writeText(value);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1200);
  }
}
