import { Component, ViewEncapsulation, signal } from '@angular/core';
import { OtpInputComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-otp-input',
  standalone: true,
  imports: [DocsSectionComponent, OtpInputComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './otp-input.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class OtpInputSection {
  protected readonly code = signal('');
  protected readonly pin = signal('');
  protected readonly lastCode = signal('');

  onComplete(value: string): void {
    this.lastCode.set(value);
  }
}
