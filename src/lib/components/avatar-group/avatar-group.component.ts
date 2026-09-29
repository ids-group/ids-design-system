import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';

@Component({
  selector: 'ds-avatar-group',
  standalone: true,
  templateUrl: './avatar-group.component.html',
  styleUrl: './avatar-group.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class AvatarGroupComponent {
  protected readonly intl = inject(DS_INTL);

  /** Avatars shown before the rest collapse into the `+N` chip. */
  readonly max = input<number>(4);
  /** Total avatar count driving the `+N` overflow; null counts the projected children. */
  readonly total = input<number | null>(null);

  protected readonly overflow = computed<number | null>(() => {
    const total = this.total();
    const max = this.max();
    if (total === null) {
      return null;
    }

    return total > max ? total - max : null;
  });
}
