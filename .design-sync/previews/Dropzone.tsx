import * as React from 'react';
import { Dropzone, type DropzoneFile } from '@ids-group-ltd/ids-design-system';

/* The dropzone stretches to its container — every story constrains the width
 * so the panel doesn't render as a very wide empty band. */
const wrap: React.CSSProperties = { maxWidth: 480 };

/** Secondary meta line projected into the `hint` slot — the DS styles it via
 *  the `[hint]` attribute selector (top border, tertiary text). */
const MetaHint = ({ children }: { children: React.ReactNode }) =>
  React.createElement('p', { hint: '' } as React.HTMLAttributes<HTMLParagraphElement>, children);

/** Idle prompt with the consumer hint slot. */
export const Idle = () => (
  <div style={wrap}>
    <Dropzone accept=".pdf,.png,.jpg" multiple hint={<MetaHint>PDF · PNG · JPG — max 10 MB per file</MetaHint>} />
  </div>
);

/** Drag-over highlight, forced statically with `dragOver`. */
export const DragOver = () => (
  <div style={wrap}>
    <Dropzone multiple dragOver />
  </div>
);

/** File list owned by the consumer — queued, uploading (progress bar at
 *  `progress`%), done and error rows. */
export const UploadQueue = () => {
  const files: DropzoneFile[] = [
    { id: 'f-1', name: 'delivery-manifest-LDS02.pdf', size: 2_516_582, state: 'uploading', progress: 65, message: 'uploading 65%' },
    { id: 'f-2', name: 'proof-of-delivery-48211.jpg', size: 1_842_003, state: 'success', progress: 100, message: 'uploaded' },
    { id: 'f-3', name: 'driver-rota-week-31.xlsx', size: 13_002_342, state: 'error', progress: 0, message: 'exceeds 10 MB limit' },
    { id: 'f-4', name: 'damage-report-TR118.docx', size: 482_133, state: 'queued', progress: 0 },
  ];
  return (
    <div style={wrap}>
      <Dropzone multiple files={files} />
    </div>
  );
};

/** `single` narrows the panel and accepts one file (replace, not append). */
export const SingleFile = () => (
  <div style={wrap}>
    <Dropzone single hint={<MetaHint>PNG · JPG · max 5 MB · one image only</MetaHint>} />
  </div>
);

/** Disabled blocks picking, dropping and the hover affordance. */
export const Disabled = () => (
  <div style={wrap}>
    <Dropzone disabled />
  </div>
);
