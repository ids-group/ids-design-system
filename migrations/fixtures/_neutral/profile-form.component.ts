import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent, InputComponent } from '@ids-group-ltd/ids-design-system';
import { ProfileService, Address } from './profile.service';

@Component({
  selector: 'app-profile-form',
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent],
  templateUrl: './profile-form.component.html',
})
export class ProfileFormComponent implements OnInit {
  private readonly profiles = inject(ProfileService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true }),
  });
  addresses: Address[] = [];
  selected: Address | null = null;
  saving = false;

  ngOnInit(): void {
    this.profiles
      .load()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((profile) => {
        this.form.patchValue(profile);
        this.addresses = profile.addresses;
      });
  }

  save(): void {
    this.saving = true;
    this.profiles.save(this.form.getRawValue()).subscribe({
      next: () => (this.saving = false),
      error: () => (this.saving = false),
    });
  }

  select(address: Address): void {
    this.selected = address;
  }

  removeAddress(event: MouseEvent, address: Address): void {
    event.stopPropagation();
    this.addresses = this.addresses.filter((other) => other.id !== address.id);
  }

  reset(): void {
    this.form.reset();
  }
}
