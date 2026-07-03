import { Component, ViewEncapsulation, signal } from '@angular/core';
import { BottomSheetComponent, ButtonComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-bottom-sheet',
  standalone: true,
  imports: [BottomSheetComponent, ButtonComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './bottom-sheet.section.html',
  styleUrl: './bottom-sheet.section.scss',
})
export class BottomSheetSection {
  protected readonly open = signal(false);
  protected readonly snapOpen = signal(false);
  protected readonly snapPoints = [0.35, 0.65, 0.9];
}
