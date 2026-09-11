import { Component, ViewEncapsulation } from '@angular/core';
import { AvatarComponent, initialsFrom } from 'ds/avatar';
import { AvatarGroupComponent } from 'ds/avatar-group';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-avatar',
  standalone: true,
  imports: [AvatarComponent, AvatarGroupComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './avatar.section.html',
  styleUrl: './avatar.section.scss',
})
export class AvatarSection {
  protected readonly initialsFrom = initialsFrom;
  protected readonly people: readonly (readonly [string, string])[] = [
    ['Alice', 'Nguyen'],
    ['Bob', 'Martin'],
    ['Carla', 'Ivanova'],
    ['Ekaterina', 'Petrova'],
    ['Farid', 'Hassan'],
    ['Grace', 'Lee'],
    ['Hiro', 'Tanaka'],
    ['Priya', 'Sharma'],
  ];
  protected readonly brandAvoid: readonly (readonly [number, number])[] = [
    [310, 360],
    [0, 20],
  ];
}
