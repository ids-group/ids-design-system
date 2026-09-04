import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { AuthLayoutComponent } from 'ds/auth-layout';
import { ButtonComponent } from 'ds/button';
import { CheckboxComponent } from 'ds/checkbox';
import { InputComponent } from 'ds/input';
import { BrandNameDirective } from 'ds/sidenav';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-auth-layout',
  standalone: true,
  imports: [
    AuthLayoutComponent,
    BrandNameDirective,
    ButtonComponent,
    CheckboxComponent,
    InputComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-layout.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    './auth-layout.section.scss',
  ],
})
export class AuthLayoutSection {}
