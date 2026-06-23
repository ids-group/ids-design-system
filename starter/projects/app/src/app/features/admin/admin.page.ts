import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '@ids-group-ltd/ids-design-system';

@Component({
  selector: 'app-admin-page',
  imports: [CardComponent],
  template: `
    <section class="admin">
      <h1>Admin</h1>
      <ds-card>
        <p>This route is protected by <code>adminGuard</code> (role-based).</p>
        <p>The mock user has the Admin role, so access is granted.</p>
      </ds-card>
    </section>
  `,
  styles: `
    .admin {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      max-width: 640px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPage {}
