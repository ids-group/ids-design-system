import { Component, ViewEncapsulation, signal } from '@angular/core';
import { OtpInputComponent } from 'ds/otp-input';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-otp-input',
  standalone: true,
  imports: [DocsSectionComponent, OtpInputComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './otp-input.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './otp-input.section.scss'],
})
export class OtpInputSection {
  protected readonly code = signal('');
  protected readonly pin = signal('');
  protected readonly lastCode = signal('');

  onComplete(value: string): void {
    this.lastCode.set(value);
  }
}
