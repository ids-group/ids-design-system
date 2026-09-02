import * as React from 'react';
import { ModalConfirm } from '@ids-group-ltd/ids-design-system';

/** The card `ModalService.confirm()` raises — default tone. */
export const Standard = () => (
  <ModalConfirm
    title="Remove stop?"
    message="Drop 14 (Rotherham S60 1TG) comes off tonight's run. The order returns to the unplanned pool."
    confirmLabel="Remove stop"
  />
);

/** `tone="error"` — destructive styling with an error confirm button. */
export const Danger = () => (
  <ModalConfirm
    title="Delete project?"
    message="Project Alpha and its 3 logistics plans will be permanently deleted."
    tone="error"
    icon="trash"
    confirmLabel="Delete"
  />
);

/** `typeToConfirm` — the confirm button stays disabled until the exact
 *  phrase is typed. Guard for high-stakes destructive actions. */
export const TypeToConfirm = () => (
  <ModalConfirm
    title="Decommission depot?"
    message="Barking depot (IG11 8BL) is removed from routing. 240 scheduled collections must be reassigned first."
    tone="error"
    icon="warn"
    typeToConfirm="DECOMMISSION"
    confirmLabel="Decommission"
  />
);
