import {
  Component,
  DestroyRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { IconComponent } from '../../icons/icon.component';
import type { DrawerSize } from './drawer.types';

let nextId = 0;

@Component({
  selector: 'ds-drawer',
  standalone: true,
  imports: [IconComponent, A11yModule],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class DrawerComponent {
  private readonly doc = inject(DOCUMENT);

  readonly open = model<boolean>(false);
  readonly size = input<DrawerSize>('md');
  readonly title = input<string>('');
  readonly closed = output<void>();

  protected readonly titleId = `ds-drawer-title-${++nextId}`;

  protected readonly classes = computed(() =>
    this.size() === 'lg' ? 'drawer lg' : 'drawer',
  );

  constructor() {
    effect(() => {
      this.doc.body.style.overflow = this.open() ? 'hidden' : '';
    });
    inject(DestroyRef).onDestroy(() => {
      this.doc.body.style.overflow = '';
    });
  }

  protected onClose(): void {
    this.open.set(false);
    this.closed.emit();
  }
}
