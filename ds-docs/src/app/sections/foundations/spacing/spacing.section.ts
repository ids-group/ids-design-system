import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface SpacingStop {
  readonly name: string;
  readonly px: string;
}

const STOPS: readonly SpacingStop[] = [
  { name: '0', px: '0px' },
  { name: 'px', px: '1px' },
  { name: '0-5', px: '2px' },
  { name: '1', px: '4px' },
  { name: '1-5', px: '6px' },
  { name: '2', px: '8px' },
  { name: '2-5', px: '10px' },
  { name: '3', px: '12px' },
  { name: '4', px: '16px' },
  { name: '5', px: '20px' },
  { name: '6', px: '24px' },
  { name: '8', px: '32px' },
  { name: '10', px: '40px' },
  { name: '12', px: '48px' },
  { name: '14', px: '56px' },
  { name: '16', px: '64px' },
  { name: '20', px: '80px' },
  { name: '24', px: '96px' },
  { name: '32', px: '128px' },
];

@Component({
  selector: 'section-foundations-spacing',
  standalone: true,
  imports: [DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './spacing.section.html',
  styleUrl: './spacing.section.scss',
})
export class SpacingSection {
  protected readonly stops = STOPS;
}
