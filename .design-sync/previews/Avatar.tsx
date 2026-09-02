import * as React from 'react';
import { Avatar } from '@ids-group-ltd/ids-design-system';

const row: React.CSSProperties = { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' };

/** xs / sm / md / lg diameters. */
export const Sizes = () => (
  <div style={row}>
    <Avatar size="xs" initials="AB" ariaLabel="Amelia Barnes" />
    <Avatar size="sm" initials="AB" ariaLabel="Amelia Barnes" />
    <Avatar initials="AB" ariaLabel="Amelia Barnes" />
    <Avatar size="lg" initials="AB" ariaLabel="Amelia Barnes" />
  </div>
);

/** Presence dot in the bottom-right corner. */
export const Presence = () => (
  <div style={row}>
    <Avatar initials="AB" status="online" ariaLabel="Amelia Barnes, Online" />
    <Avatar initials="JR" status="away" ariaLabel="James Reeves, Away" />
    <Avatar initials="SK" status="busy" ariaLabel="Sara Kim, Busy" />
    <Avatar initials="MO" status="offline" ariaLabel="Mike O'Brien, Offline" />
  </div>
);

/** Off-token `{ bg, fg }` tints and the neutral overflow-chip treatment. */
export const Tints = () => (
  <div style={row}>
    <Avatar initials="AB" ariaLabel="Amelia Barnes" />
    <Avatar
      initials="JR"
      tint={{ bg: 'var(--orange-100)', fg: 'var(--orange-700)' }}
      ariaLabel="James Reeves"
    />
    <Avatar
      initials="SK"
      tint={{ bg: 'var(--green-100)', fg: 'var(--green-700)' }}
      ariaLabel="Sara Kim"
    />
    <Avatar initials="+3" tint="neutral" ariaLabel="3 more drivers" />
  </div>
);

/** Icon fallback when there's no image and no initials. */
export const FallbackIcon = () => (
  <div style={row}>
    <Avatar size="xs" fallbackIcon="user" />
    <Avatar size="sm" fallbackIcon="user" />
    <Avatar fallbackIcon="user" />
    <Avatar size="lg" fallbackIcon="user" />
  </div>
);
