import { Component, ViewEncapsulation, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'ds-search',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class SearchComponent {
  readonly value = model<string>('');
  readonly placeholder = input<string>('Search');
  readonly shortcut = input<string>('');
  readonly showIcon = input<boolean>(true);
  readonly submitted = output<string>();

  protected onSubmit(): void {
    this.submitted.emit(this.value());
  }
}
