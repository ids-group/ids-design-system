import { Component, ViewEncapsulation, input } from '@angular/core';
import { SIDENAV, type SidenavContract } from './sidenav.token';

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
  providers: [{ provide: SIDENAV, useExisting: SidenavComponent }],
})
export class SidenavComponent implements SidenavContract {
  readonly collapsed = input<boolean>(false);
  readonly brand = input<string>('');
}
