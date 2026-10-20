import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-profile-form',
  template: `
    <form (submit)="save()">
      <ds-button
        type="submit"
        [loading]="busy()"
        [disabled]="busy() && invalid()">
        Save
      </ds-button>
    </form>
  `,
})
export class ProfileFormComponent {
  protected readonly busy = signal(false);
  protected readonly name = signal('');
  protected readonly submitted = signal(false);
  protected readonly invalid = computed(() => this.name().length === 0);

  protected save(): void {
    this.submitted.set(true);
    if (this.invalid()) return;
    this.busy.set(true);
  }
}
