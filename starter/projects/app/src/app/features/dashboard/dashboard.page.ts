import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CardComponent } from '@ids-group-ltd/ids-design-system';
import { AuthStore } from '@app/common';

@Component({
  selector: 'app-dashboard-page',
  imports: [CardComponent],
  template: `
    <section class="dashboard">
      <h1>Dashboard</h1>
      <ds-card>
        <p>Welcome, {{ user()?.fullName }}.</p>
        <p>This starter runs on a mock backend — no server required.</p>
      </ds-card>
    </section>
  `,
  styles: `
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      max-width: 640px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly authStore = inject(AuthStore);
  protected readonly user = this.authStore.currentUser;
}
