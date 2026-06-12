import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, EmptyStateComponent, IconComponent } from 'ds';

@Component({
  selector: 'section-components-empty-state',
  standalone: true,
  imports: [ButtonComponent, EmptyStateComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './empty-state.section.html',
  styleUrl: './empty-state.section.scss',
})
export class EmptyStateComponentSection {}
