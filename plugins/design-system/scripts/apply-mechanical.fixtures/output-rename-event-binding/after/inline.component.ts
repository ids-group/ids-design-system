@Component({ selector: 'app-inline', template: `<ds-banner (closed)="onDismissed()"></ds-banner>` })
export class InlineComponent {
  onDismissed(): void {}
}
