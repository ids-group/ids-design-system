import { Component, ViewEncapsulation } from '@angular/core';
import { AvatarComponent, AvatarGroupComponent } from 'ds';

@Component({
  selector: 'section-components-avatar',
  standalone: true,
  imports: [AvatarComponent, AvatarGroupComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './avatar.section.html',
  styleUrl: './avatar.section.scss',
})
export class AvatarSection {}
