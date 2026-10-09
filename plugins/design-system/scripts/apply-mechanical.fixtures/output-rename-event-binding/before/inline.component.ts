@Component({ selector: 'app-inline', template: `<ds-banner (dismissed)="onDismissed()"></ds-banner>` })
export class InlineComponent {
  onDismissed(): void {}
}
