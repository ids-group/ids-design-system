import {
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  effect,
  inject,
  input,
} from '@angular/core';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import { AvatarComponent } from '@ids-group-ltd/ids-design-system/components/avatar';

@Component({
  selector: 'ds-avatar-group',
  standalone: true,
  templateUrl: './avatar-group.component.html',
  styleUrl: './avatar-group.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class AvatarGroupComponent {
  protected readonly intl = inject(DS_INTL);

  /** Avatars shown before the rest collapse into the `+N` chip; projected avatars past it are hidden. */
  readonly max = input<number>(4);
  /** Total avatar count driving the `+N` overflow; null counts the projected children. */
  readonly total = input<number | null>(null);

  private readonly avatars = contentChildren(AvatarComponent, {
    read: ElementRef,
  });

  protected readonly overflow = computed<number | null>(() => {
    const total = this.total() ?? this.avatars().length;
    const max = this.max();

    return total > max ? total - max : null;
  });

  constructor() {
    effect(() => {
      const max = this.max();
      this.avatars().forEach((avatar, index) =>
        (avatar.nativeElement as HTMLElement).toggleAttribute(
          'data-avatar-group-hidden',
          index >= max,
        ),
      );
    });
  }
}
