import { BannerComponent } from '@ids-group-ltd/ids-design-system';

export class AppBanner extends BannerComponent {
  protected override get ariaRole(): 'alert' | 'status' {
    return 'alert';
  }
}

export class AppBannerReader extends BannerComponent {
  liveness(): 'assertive' | 'polite' {
    // @ts-expect-error after TS2322
    return this.ariaLive;
  }
}
