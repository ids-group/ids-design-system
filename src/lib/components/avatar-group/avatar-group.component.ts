import { Component, ViewEncapsulation, computed, input } from '@angular/core';

@Component({
  selector: 'ds-avatar-group',
  standalone: true,
  templateUrl: './avatar-group.component.html',
  styleUrl: './avatar-group.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class AvatarGroupComponent {
  readonly max = input<number>(4);
  readonly total = input<number | null>(null);

  protected readonly overflow = computed<number | null>(() => {
    const total = this.total();
    const max = this.max();
    if (total === null) return null;
    return total > max ? total - max : null;
  });
}
