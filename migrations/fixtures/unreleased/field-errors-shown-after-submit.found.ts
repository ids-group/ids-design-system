export class InviteForm {
  protected readonly inviteForm = form(this.model, inviteSchema);

  protected send(): void {
    void submit(this.inviteForm, async () => this.api.invite(this.model()));
  }
}
