import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'ds/button';
import { EmptyStateComponent } from 'ds/empty-state';
import { IconComponent } from 'ds/icons';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-empty-state',
  standalone: true,
  imports: [
    ButtonComponent,
    DocsSectionComponent,
    EmptyStateComponent,
    IconComponent,
    RouterLink,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './empty-state.section.html',
  styleUrl: './empty-state.section.scss',
})
export class EmptyStateComponentSection {}
