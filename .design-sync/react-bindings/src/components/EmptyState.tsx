import * as React from 'react';
import { host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';
import { LoadingOverlay } from './LoadingOverlay';

export type EmptyStateVariant = 'none' | 'loading' | 'error' | 'locked' | 'success';

const DEFAULT_ICON: Record<EmptyStateVariant, IconName> = {
  none: 'package',
  loading: 'package',
  error: 'warn',
  locked: 'lock',
  success: 'success',
};

export interface EmptyStateProps {
  /** State — drives the default icon and shows a loading overlay when `'loading'`. */
  variant?: EmptyStateVariant;
  /** Override the variant's default icon. */
  icon?: IconName | null;
  /** Optional heading below the icon. */
  title?: string;
  /** Optional supporting text below the title. */
  body?: string;
  /** Call-to-action content below the text (the `[actions]` slot). */
  actions?: React.ReactNode;
}

/** Centred placeholder for empty/error/locked/loading regions — port of
 *  `ds-empty-state`. Composition: icon tile + title + body + CTA slot,
 *  wrapped in a LoadingOverlay that activates when `variant="loading"`. */
export function EmptyState({
  variant = 'none',
  icon = null,
  title = '',
  body = '',
  actions,
}: EmptyStateProps) {
  return host(
    'ds-empty-state',
    null,
    <LoadingOverlay spinnerSize="lg" loading={variant === 'loading'} blur>
      <span className={variant === 'none' ? 'empty-state' : `empty-state ${variant}`}>
        <span className="icon-tile">
          <Icon name={icon ?? DEFAULT_ICON[variant]} size={28} />
        </span>

        {title && <span className="title">{title}</span>}

        {body && <span className="body">{body}</span>}

        <span className="cta">{actions}</span>
      </span>
    </LoadingOverlay>,
  );
}
