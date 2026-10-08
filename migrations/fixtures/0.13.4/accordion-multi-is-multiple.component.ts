import { Component } from '@angular/core';
import { AccordionComponent } from '@ids-group-ltd/ids-design-system';

@Component({
  selector: 'app-accordion-multi',
  imports: [AccordionComponent],
  template: `
    <!-- expect: after NG8002 -->
    <ds-accordion [multi]="false"></ds-accordion>
    <ds-accordion multi="false"></ds-accordion>
  `,
})
export class AppAccordionMulti {}
