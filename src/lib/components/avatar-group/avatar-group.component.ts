import { Component, ViewEncapsulation, computed, input } from '@angular/core';

@Component({
  selector: 'ds-avatar-group',
  standalone: true,
  templateUrl: './avatar-group.component.html',
  styleUrl: './avatar-group.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class AvatarGroupComponent {
  /** Maximum avatars shown before the rest collapse into an overflow chip. */
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
