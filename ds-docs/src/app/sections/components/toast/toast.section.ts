import { Component, ViewEncapsulation, inject } from '@angular/core';
import { ButtonComponent, ToastComponent, ToastService } from 'ds';

@Component({
  selector: 'section-components-toast',
  standalone: true,
  imports: [ButtonComponent, ToastComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-toast" data-anchor="toast" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Toast</h2>
      <p class="lede t-m">
        Auto-dismissing notification anchored to top-right of the viewport. Stacks vertically.
        Trigger imperatively via <code class="t-mono">ToastService.show()</code> — one variant
        per system event severity.
      </p>

      <h3 class="block-title t-h4">States showcase (static specimens)</h3>
      <div class="states">
        <ds-toast variant="info" title="Recompute queued" message="3 logistics plans will update in a moment." [dismissible]="true" />
        <ds-toast variant="success" title="Alpha saved" message="12 resource allocations updated." [dismissible]="true" />
        <ds-toast variant="warning" title="Volume nearing limit" message="92% / 95% on Lane 04." />
        <ds-toast variant="error" title="Inventory sync failed" message="Connection timed out — retrying in 30s." />
      </div>

      <h3 class="block-title t-h4">Live demo</h3>
      <p class="block-desc t-s">Click a button to trigger a toast (auto-dismisses after 5 s).</p>
      <div class="demo">
        <ds-button variant="ghost" size="m" (click)="fire('info')">Info</ds-button>
        <ds-button variant="ghost" size="m" (click)="fire('success')">Success</ds-button>
        <ds-button variant="ghost" size="m" (click)="fire('warning')">Warning</ds-button>
        <ds-button variant="ghost" size="m" (click)="fire('error')">Error</ds-button>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--brand); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); max-width: var(--col-cap-text); }

    .states {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
      max-width: 480px;
    }

    .demo {
      display: inline-flex;
      gap: var(--s-2);
      margin-top: var(--s-3);
      padding: var(--s-3) var(--s-4);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
    }
    code.t-mono {
      font: var(--fw-regular) var(--fs-mono)/1 var(--font-mono);
      background: var(--surface-secondary);
      padding: 1px var(--s-1);
      border-radius: var(--r-sm);
      color: var(--text-primary);
    }
  `],
})
export class ToastSection {
  private readonly toast = inject(ToastService);

  fire(variant: 'info' | 'success' | 'warning' | 'error'): void {
    const messages = {
      info:    { title: 'Recompute queued',     body: '3 logistics plans will update in a moment.' },
      success: { title: 'Alpha saved',          body: '12 resource allocations updated.' },
      warning: { title: 'Volume nearing limit', body: '92% / 95% on Lane 04.' },
      error:   { title: 'Inventory sync failed',body: 'Connection timed out — retrying in 30s.' },
    };
    const message = messages[variant];
    this.toast.show({ title: message.title, body: message.body, variant });
  }
}
