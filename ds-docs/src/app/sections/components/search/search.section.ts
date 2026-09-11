import { Component, ViewEncapsulation, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SearchComponent } from 'ds/search';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-search',
  standalone: true,
  imports: [SearchComponent, DocsSectionComponent, ReactiveFormsModule],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './search.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './search.section.scss'],
})
export class SearchSection {
  protected readonly debounced = signal('');
  protected readonly queryControl = new FormControl('');
  /** Read back through the control's own stream: `queryControl.value` in the
   *  template is a plain property, so nothing re-renders it. */
  protected readonly queryValue = toSignal(this.queryControl.valueChanges, {
    initialValue: '',
  });
}
