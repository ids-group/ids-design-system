# Dropzone

File upload drop target — port of `ds-dropzone`. The whole panel is a label around a hidden file input, so clicking anywhere opens the native picker; drag-and-drop also works. The consumer owns the file list and upload state.

- Empty `files` → the upload prompt ("Drop files here / or click to browse", plus your `hint` slot content). Non-empty → per-file rows with a state icon, name, meta line and (while `state: 'uploading'`) a progress bar at `progress`%.
- `files: DropzoneFile[]` — `{ id, name, size, state: 'queued' | 'uploading' | 'success' | 'error', progress, message? }`. `size` is bytes (formatted to B/KB/MB); `message` replaces the bare state in the meta line (e.g. "exceeds 10 MB limit").
- `onFilesAdded(File[])` fires on pick or drop — validate and append to `files` yourself. `onFileRemoved(file)` fires from each row's × button.
- `accept` and `multiple` pass through to the native input; `single: true` forces one file and narrows the panel; `disabled` blocks all interaction.
- `dragOver: true` forces the drag-over highlight for static rendering (live drag events drive it otherwise).

```tsx
<Dropzone
  accept=".pdf,.jpg"
  multiple
  files={[
    { id: 'pod-1', name: 'POD-48211.pdf', size: 482300, state: 'success', progress: 100, message: 'uploaded' },
    { id: 'pod-2', name: 'damage-photo.jpg', size: 2411000, state: 'uploading', progress: 45 },
  ]}
  onFilesAdded={queueUploads}
  onFileRemoved={removeFile}
/>
```
