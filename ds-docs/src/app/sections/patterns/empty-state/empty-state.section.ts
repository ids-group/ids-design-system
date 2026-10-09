import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { CardComponent } from 'ds/card';
import { EmptyStateComponent } from 'ds/empty-state';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'pattern-empty-state',
  standalone: true,
  imports: [
    ButtonComponent,
    CardComponent,
    DocsSectionComponent,
    EmptyStateComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './empty-state.section.html',
  styleUrl: './empty-state.section.scss',
})
export class EmptyStateSection {
  protected readonly lede =
    'Five variants: none, loading, error, locked and success; each has a clear message and at most one primary action.';
}
