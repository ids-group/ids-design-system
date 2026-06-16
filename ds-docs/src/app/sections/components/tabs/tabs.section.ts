import { Component, ViewEncapsulation } from '@angular/core';
import { TabsComponent, TabComponent } from 'ds';
import { DocsTruncationComponent, TruncationRule } from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-tabs',
  standalone: true,
  imports: [TabsComponent, TabComponent, DocsTruncationComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './tabs.section.html',
  styleUrl: './tabs.section.scss',
})
export class TabsSection {
  protected readonly truncationRules: TruncationRule[] = [
    { field: 'Tab label', behaviour: 'Single line, no clip — labels are short. Tooltip on hover if forced clip.' },
    { field: 'Badge count', behaviour: 'Numeric only — no clip.' },
  ];
}
