import { Component, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'ds-sidenav',
  standalone: true,
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.sidenav]': 'true',
    '[class.collapsed]': 'collapsed()',
  },
})
export class SidenavComponent {
  readonly collapsed = input<boolean>(false);
  readonly brand = input<string>('');
}
