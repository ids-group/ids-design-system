import { Component, ViewEncapsulation, signal } from '@angular/core';
import { TabsComponent, TabComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-tabs',
  standalone: true,
  imports: [
    DocsSectionComponent,
    DocsTruncationComponent,
    TabsComponent,
    TabComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './tabs.section.html',
  styleUrls: ['./tabs.section.scss', './tabs.section.responsive.scss'],
})
export class TabsSection {
  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Tab label',
      behaviour:
        'Single line, no clip — labels are short. Tooltip on hover if forced clip.',
    },
    { field: 'Badge count', behaviour: 'Numeric only — no clip.' },
  ];

  protected readonly closableTabs = signal([
    { label: 'Overview', value: 'overview' },
    { label: 'Analytics', value: 'analytics' },
    { label: 'Reports', value: 'reports' },
    { label: 'Settings', value: 'settings' },
  ]);

  protected onTabClose(value: string): void {
    this.closableTabs.update((tabs) =>
      tabs.filter((tab) => tab.value !== value),
    );
  }
}
