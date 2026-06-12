import { Component, ViewEncapsulation, signal } from '@angular/core';
import { BottomSheetComponent, ButtonComponent } from 'ds';

@Component({
  selector: 'section-components-bottom-sheet',
  standalone: true,
  imports: [BottomSheetComponent, ButtonComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './bottom-sheet.section.html',
  styleUrl: './bottom-sheet.section.scss',
})
export class BottomSheetSection {
  protected readonly open = signal(false);
}
