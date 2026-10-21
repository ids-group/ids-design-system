export class ProfileForm {
  protected readonly profile = new FormGroup({ name: new FormControl('', Validators.required) });

  protected save(): void {
    this.profile.markAllAsTouched();
    if (this.profile.invalid) {
      return;
    }
    this.api.save(this.profile.value);
  }
}
