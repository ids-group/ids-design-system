import * as React from 'react';
import { Avatar, AvatarGroup } from '@ids-group-ltd/ids-design-system';

/** `total` beyond `max` appends the neutral +N chip — render at most
 *  `max` Avatar children yourself; the group never slices. */
export const Overflow = () => (
  <AvatarGroup max={3} total={7}>
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
  </AvatarGroup>
);

/** Whole crew fits within `max` — no overflow chip. */
export const Full = () => (
  <AvatarGroup>
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
    <Avatar initials="MO" ariaLabel="Mike O'Brien" />
  </AvatarGroup>
);
