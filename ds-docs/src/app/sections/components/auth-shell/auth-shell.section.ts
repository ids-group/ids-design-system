import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {
  AuthShellComponent,
  BrandNameDirective,
  ButtonComponent,
  CheckboxComponent,
  InputComponent,
} from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-auth-shell',
  standalone: true,
  imports: [
    AuthShellComponent,
    BrandNameDirective,
    ButtonComponent,
    CheckboxComponent,
    InputComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-shell.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './auth-shell.section.scss'],
})
export class AuthShellSection {}
