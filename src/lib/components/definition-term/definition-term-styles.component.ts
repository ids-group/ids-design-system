import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

/** @internal Never rendered: creating it once registers the `.ds-definition-term` rules globally. */
@Component({
  standalone: true,
  template: '',
  styleUrl: './definition-term.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefinitionTermStylesComponent {}
