import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { DsPopoverTrigger, PopoverComponent } from 'ds/popover';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsNonmodalNoteComponent } from '../../../shared/docs-nonmodal-note.component';

@Component({
  selector: 'section-components-popover',
  standalone: true,
  imports: [
    ButtonComponent,
    DsPopoverTrigger,
    PopoverComponent,
    DocsSectionComponent,
    DocsNonmodalNoteComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './popover.section.html',
  styleUrl: './popover.section.scss',
})
export class PopoverSection {}
