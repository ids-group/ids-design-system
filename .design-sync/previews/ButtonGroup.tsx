import * as React from 'react';
import { Button, ButtonGroup } from '@ids-group-ltd/ids-design-system';

/** Related neutral-outline actions fused into one control — outer corners keep
 *  the radius, inner borders collapse to a single divider. */
export const Basic = () => (
  <ButtonGroup ariaLabel="Text formatting">
    <Button color="neutral" variant="outline">Bold</Button>
    <Button color="neutral" variant="outline">Italic</Button>
    <Button color="neutral" variant="outline">Underline</Button>
  </ButtonGroup>
);

/** Children keep their own Button props — icons, disabled — inside the group. */
export const WithIcons = () => (
  <ButtonGroup ariaLabel="Manifest actions">
    <Button color="neutral" variant="outline" icon="download">Export</Button>
    <Button color="neutral" variant="outline" icon="upload">Import</Button>
    <Button color="neutral" variant="outline" icon="trash" disabled>Delete</Button>
  </ButtonGroup>
);

/** A compact pager built from sm buttons. */
export const Pager = () => (
  <ButtonGroup ariaLabel="Manifest pages">
    <Button color="neutral" variant="outline" size="sm" icon="chevronLeft">Prev</Button>
    <Button color="neutral" variant="outline" size="sm">Page 3 of 12</Button>
    <Button color="neutral" variant="outline" size="sm" trailingIcon="chevronRight">Next</Button>
  </ButtonGroup>
);
