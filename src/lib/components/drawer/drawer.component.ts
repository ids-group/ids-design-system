import { Component, ViewEncapsulation, computed, input, model, output } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { DrawerSize } from './drawer.types';

@Component({
  selector: 'ds-drawer',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class DrawerComponent {
  readonly open = model<boolean>(false);
  readonly size = input<DrawerSize>('md');
  readonly title = input<string>('');
  readonly closed = output<void>();

  protected readonly classes = computed(() =>
    this.size() === 'lg' ? 'drawer lg' : 'drawer'
  );

  protected onClose(): void {
    this.open.set(false);
    this.closed.emit();
  }
}
