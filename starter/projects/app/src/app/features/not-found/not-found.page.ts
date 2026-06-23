import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  CardComponent,
} from '@ids-group-ltd/ids-design-system';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, ButtonComponent, CardComponent],
  template: `
    <section class="not-found">
      <ds-card>
        <h1 class="code">404</h1>
        <p class="lede">This page doesn't exist.</p>
        <ds-button routerLink="/">Go home</ds-button>
      </ds-card>
    </section>
  `,
  styles: `
    .not-found {
      display: grid;
      place-items: center;
      min-height: 60vh;
      padding: var(--space-6);
      text-align: center;

      .code {
        margin: 0;
        font: var(--font-weight-bold) var(--font-size-2xl) /
          var(--line-height-flat) var(--font-sans);
        color: var(--primary);
      }

      .lede {
        margin: var(--space-2) 0 var(--space-4);
        color: var(--text-secondary);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
