import { Component, ViewEncapsulation } from '@angular/core';
import { InfoHintComponent } from 'ds/info-hint';
import { TagComponent } from 'ds/tag';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-foundations-accessibility',
  standalone: true,
  imports: [DocsSectionComponent, InfoHintComponent, TagComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './accessibility.section.html',
  styleUrl: './accessibility.section.scss',
})
export class AccessibilitySection {}
