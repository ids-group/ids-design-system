import { Component, ViewEncapsulation } from '@angular/core';
import { BannerComponent, ButtonComponent, DropdownComponent, type DropdownOption, IconComponent, ModalCardComponent } from 'ds';

@Component({
  selector: 'section-components-modal',
  standalone: true,
  imports: [BannerComponent, ButtonComponent, DropdownComponent, IconComponent, ModalCardComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './modal.section.html',
  styleUrl: './modal.section.scss',
})
export class ModalSection {
  protected readonly ownerOptions: DropdownOption[] = [
    { label: 'Avery Brooks', value: 'brooks' },
    { label: 'Sam Carter', value: 'carter' },
    { label: 'Jamie Lin', value: 'lin' },
    { label: 'Morgan Reyes', value: 'reyes' },
  ];
}
