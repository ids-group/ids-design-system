import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-invite-form',
  template: `
    <form (submit)="invite()">
      <ds-button
        type="submit"
        [loading]="sending()"
        [disabled]="sending() && invalid()">
        Invite
      </ds-button>
    </form>
  `,
})
export class InviteFormComponent {
  protected readonly sending = signal(false);
  protected readonly email = signal('');
  protected readonly invalid = computed(() => !this.email().includes('@'));

  protected invite(): void {
    if (this.invalid()) return;
    this.sending.set(true);
  }
}
