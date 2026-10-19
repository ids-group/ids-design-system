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

  protected readonly whenClippedSnippet = `<span dsTooltipWhenClipped>…</span>
<div dsTooltipWhenClipped=".label">…</div>
<div [dsTooltipWhenClipped]="truncate ? ':scope > .cell' : false">…</div>
<p class="two-lines" dsTooltipWhenClipped>…</p>`;

  protected readonly infoHintContentSnippet = `<ds-info-hint ariaLabel="When v4 was published">
  <ul>…</ul>
</ds-info-hint>

<ds-info-hint ariaLabel="When v4 was published" [content]="published" />
<ng-template #published><ul>…</ul></ng-template>

<ds-info-hint class="removed" icon="warn" ariaLabel="Why removed" text="…" />
.removed { --ds-info-hint-color: var(--warning-text); }`;

  protected readonly pinnedSnippet = `@use 'styles/pinned';

.my-trigger[data-ds-tooltip-pinned] {
  @include pinned.cue();

  &:hover { @include pinned.cue-hover(); }
  &:active { @include pinned.cue-pressed(); }
}`;
}
