import { Component, ViewEncapsulation, input } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'ds-stepper',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: { role: 'list', 'aria-label': 'Progress' },
})
export class StepperComponent {
  readonly steps = input<readonly string[]>([]);
  readonly current = input<number>(0);

  protected stepState(i: number): 'completed' | 'current' | 'upcoming' {
    const c = this.current();
    if (i < c) {return 'completed';}
    if (i === c) {return 'current';}

    return 'upcoming';
  }

  protected nodeClass(i: number): string {
    const c = this.current();
    if (i < c) {return 'node done';}
    if (i === c) {return 'node active';}

    return 'node';
  }

  protected barClass(i: number): string {
    return i < this.current() ? 'bar done' : 'bar';
  }
}
