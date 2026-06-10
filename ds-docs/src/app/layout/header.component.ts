import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <header class="docs-header">
      <a routerLink="/" class="brand">
        <strong>ManageMy DS</strong>
        <span class="t-xs eyebrow">Reference</span>
      </a>
    </header>
  `,
  styles: [`
    .docs-header {
      position: sticky;
      top: 0;
      z-index: var(--layer-sticky);
      background: var(--surface-default);
      border-bottom: var(--border-width-default) solid var(--border-divider);
      padding: var(--space-3) var(--space-5);
      display: flex;
      align-items: center;
      gap: var(--space-3);
      height: var(--topbar-h);
    }
    .brand {
      display: flex;
      align-items: baseline;
      gap: var(--space-2);
      text-decoration: none;
      color: var(--text-primary);
    }
    .eyebrow { color: var(--text-tertiary); }
  `],
})
export class HeaderComponent {}
