import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, CardComponent, EmptyStateComponent, IconComponent } from 'ds';

@Component({
  selector: 'pattern-empty-state',
  standalone: true,
  imports: [ButtonComponent, CardComponent, EmptyStateComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './empty-state.section.html',
  styleUrl: './empty-state.section.scss',
})
export class EmptyStateSection {
  protected readonly lede =
    'Four canonical variants. Each has a distinct icon background, a clear message, and at most one primary action.';
}
