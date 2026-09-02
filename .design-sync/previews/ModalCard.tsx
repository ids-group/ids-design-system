import * as React from 'react';
import { Button, ModalCard } from '@ids-group-ltd/ids-design-system';

/** Bare dialog card in flow — header, body and actions, no scrim. */
export const Standard = () => (
  <ModalCard
    title="Reassign driver"
    showClose={false}
    actions={
      <>
        <Button color="neutral" variant="outline">
          Cancel
        </Button>
        <Button>Reassign</Button>
      </>
    }
  >
    Move run 22 from Amelia Barnes to the on-call driver for tonight only?
    The manifest and POD chain stay with the run.
  </ModalCard>
);

/** Icon badge next to the title, plus the header close button. */
export const WithIcon = () => (
  <ModalCard
    title="Assign vehicle"
    icon="truck"
    actions={
      <>
        <Button color="neutral" variant="outline">
          Not now
        </Button>
        <Button>Assign YK24 XQL</Button>
      </>
    }
  >
    Tractor unit YK24 XQL is free after the 14:20 tip at Sheffield S1 2HE
    and fits the trailer class for this load.
  </ModalCard>
);

/** `error` — danger accent on title and icon badge. */
export const Danger = () => (
  <ModalCard
    title="Scrap manifest?"
    status="error"
    icon="warn"
    showClose={false}
    actions={
      <>
        <Button color="neutral" variant="outline">
          Keep manifest
        </Button>
        <Button color="error">Scrap</Button>
      </>
    }
  >
    Manifest MAN-0491 and its 22 drop confirmations will be deleted. Drivers
    already en route are not notified.
  </ModalCard>
);
