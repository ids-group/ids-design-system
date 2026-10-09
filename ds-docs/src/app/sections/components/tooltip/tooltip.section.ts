import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { SwitchComponent } from 'ds/switch';
import { TabComponent, TabsComponent } from 'ds/tabs';
import { InfoHintComponent } from 'ds/info-hint';
import { DefinitionTermDirective } from 'ds/definition-term';
import { TooltipDirective, TooltipPanelComponent } from 'ds/tooltip';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-tooltip',
  standalone: true,
  imports: [
    ButtonComponent,
    DefinitionTermDirective,
    DocsSectionComponent,
    InfoHintComponent,
    SwitchComponent,
    TabComponent,
    TabsComponent,
    TooltipDirective,
    TooltipPanelComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './tooltip.section.html',
  styleUrl: './tooltip.section.scss',
})
export class TooltipSection {
  protected readonly truncate = signal(true);

  protected readonly pinnedSnippet = `@use 'styles/pinned';

.my-trigger[data-ds-tooltip-pinned] {
  @include pinned.cue();

  &:hover { @include pinned.cue-hover(); }
  &:active { @include pinned.cue-pressed(); }
}

.my-icon-trigger[data-ds-tooltip-pinned] {
  @include pinned.cue($underline: false);

  &:hover { @include pinned.cue-hover($underline: false); }
  &:active { @include pinned.cue-pressed($underline: false); }
}`;
}
