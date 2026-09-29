import { inject } from '@angular/core';
import { devWarn } from './dev-warning';
import { DS_CONFIG } from './ds-config';

export interface AnnounceState {
  variant: string;
  title: string;
  /** Whether the element would announce as `role="alert"` rather than `status`. */
  assertive: boolean;
  /** The element's own `announce` input, `null` while unbound. */
  announce: boolean | null;
}

/**
 * Warns about the two ways `announce` on `ds-banner` / `ds-alert` goes wrong without anyone
 * deciding it: an assertive element left unbound while `DS_CONFIG.<section>.announce` is unset
 * (a screen reader will not hear it), and a polite one that announces only because that key is
 * `true` (nearly always page furniture). Once per instance, dev mode only; the caller wraps the
 * call in the `typeof ngDevMode` guard (see `devWarn`). Must be called from an injection context.
 * @internal
 */
export function warnAnnounceOversight(
  tag: 'ds-banner' | 'ds-alert',
  section: 'banner' | 'alert',
  state: () => AnnounceState,
): void {
  const configured = inject(DS_CONFIG)[section]?.announce;
  devWarn(() => {
    const { variant, title, assertive, announce } = state();
    if (announce !== null) {
      return null;
    }
    const element = `[${tag}] variant="${variant}"${title ? ` title="${title}"` : ''}`;
    if (assertive && configured === undefined) {
      return `${element} is not announced, so a screen reader will not hear it. Decide once for the app with provideDsConfig({ ${section}: { announce: true } }) and bind [announce]="false" on page furniture; this warning ends once the key is set, true or false.`;
    }
    if (!assertive && configured === true) {
      return `${element} announces because DS_CONFIG.${section}.announce is true, not because this element asked to. Bind [announce]="false" if it is page furniture, or [announce]="true" to keep it announced on purpose.`;
    }

    return null;
  });
}
