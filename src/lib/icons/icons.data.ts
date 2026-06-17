// Inline SVG icon set. Ported 1:1 from CLAUDE_DESIGN_DS/ds-icons.jsx.
// All paths render inside <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">, stroke-width 1.75.

export const ICONS = {
  search: '<circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />',
  plus: '<path d="M12 5v14M5 12h14" />',
  minus: '<path d="M5 12h14" />',
  check: '<path d="m4 12 5 5L20 6" />',
  x: '<path d="M6 6l12 12M18 6L6 18" />',
  chevronDown: '<path d="m6 9 6 6 6-6" />',
  chevronRight: '<path d="m9 6 6 6-6 6" />',
  chevronLeft: '<path d="m15 6-6 6 6 6" />',
  chevronUp: '<path d="m6 15 6-6 6 6" />',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6" />',
  arrowUp: '<path d="M12 19V5M6 11l6-6 6 6" />',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6" />',
  info: '<circle cx="12" cy="12" r="9" /><path d="M12 8v.01M11 12h1v4h1" />',
  warn: '<path d="M12 3 2 21h20L12 3z" /><path d="M12 10v4M12 18v.01" />',
  error: '<circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16v.01" />',
  success: '<circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" />',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10 21a2 2 0 0 0 4 0" />',
  settings:
    '<circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />',
  user: '<circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />',
  users:
    '<circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0" /><path d="M16 4a4 4 0 0 1 0 8M22 21a6 6 0 0 0-6-6" />',
  home: '<path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" />',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />',
  truck:
    '<path d="M3 16V6a1 1 0 0 1 1-1h11v11" /><path d="M15 9h4l2 3v4h-6" /><circle cx="7.5" cy="17.5" r="2" /><circle cx="17.5" cy="17.5" r="2" />',
  box: '<path d="m21 8-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="m12 13 .01 8" />',
  map: '<path d="m9 4-6 3v13l6-3 6 3 6-3V4l-6 3-6-3z" /><path d="M9 4v13M15 7v13" />',
  activity: '<path d="M3 12h4l3-9 4 18 3-9h4" />',
  folder:
    '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />',
  edit: '<path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z" />',
  external:
    '<path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />',
  trash:
    '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" />',
  download: '<path d="M12 4v12M6 12l6 6 6-6" /><path d="M4 20h16" />',
  upload: '<path d="M12 20V8M6 12l6-6 6 6" /><path d="M4 4h16" />',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />',
  filter: '<path d="M3 5h18l-7 9v6l-4-2v-4z" />',
  sort: '<path d="M7 4v16M3 8l4-4 4 4" /><path d="M17 20V4M21 16l-4 4-4-4" />',
  sortAsc: '<path d="M7 18V6M3 10l4-4 4 4" />',
  sortDesc: '<path d="M7 6v12M11 14l-4 4-4-4" />',
  grid: '<rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />',
  list: '<path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1.2" /><circle cx="3.5" cy="12" r="1.2" /><circle cx="3.5" cy="18" r="1.2" />',
  moreH:
    '<circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />',
  moreV:
    '<circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />',
  link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />',
  flag: '<path d="M5 21V5a14 14 0 0 1 14 0v9a14 14 0 0 1-14 0z" />',
  star: '<path d="m12 3 2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17.8 6.2 21l1.1-6.5L2.5 9.9 9.1 9z" />',
  inbox:
    '<path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5 4h14l3 8v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z" />',
  archive:
    '<rect x="3" y="3" width="18" height="5" rx="1" /><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M10 12h4" />',
  clock: '<circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />',
  refresh:
    '<path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" />',
  play: '<path d="M6 4l14 8-14 8z" />',
  pause: '<path d="M7 4v16M17 4v16" />',
  cmd: '<path d="M9 9h6v6H9zM6 9V7a3 3 0 1 1 3 3H6zM6 15v2a3 3 0 1 0 3-3H6zM18 9V7a3 3 0 1 0-3 3h3zM18 15v2a3 3 0 1 1-3-3h3z" />',
  paperclip:
    '<path d="m21 11-9 9a5 5 0 0 1-7-7l9-9a3 3 0 0 1 4 4l-9 9a1 1 0 0 1-1-1l8-8" />',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" />',
  image:
    '<rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" />',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />',
  logout:
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" />',
  help: '<circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4M12 17v.01" />',
  pin: '<path d="M12 22v-7" /><path d="m9 15 6 0M8 9l8 0M9 15c-2-1.5-3-4-3-7l12 0c0 3-1 5.5-3 7" />',
  bookmark: '<path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-4z" />',
  sparkle:
    '<path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M5.6 18.4l4.2-4.2M14.2 9.8l4.2-4.2" />',
  layers:
    '<path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5M3 18l9 5 9-5" />',
  chart: '<path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-5" />',
  gauge:
    '<path d="M12 14l4-4" /><circle cx="12" cy="14" r="9" /><path d="M3 14a9 9 0 0 1 18 0" />',
  package:
    '<path d="M3 7v10l9 4 9-4V7l-9-4z" /><path d="m3 7 9 5 9-5M12 12v9" />',
  git: '<circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="12" r="2.5" /><path d="M6 8.5v7M8.5 6h4a3 3 0 0 1 3 3v0" />',
  sun: '<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />',
  moon: '<path d="M21 13a9 9 0 0 1-12-12 9 9 0 1 0 12 12z" />',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" />',
  rotate: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />',
  qr: '<rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3zM18 18h3v3h-3z" />',
  globe:
    '<circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />',
  phone:
    '<path d="M5 4h4l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />',
  bin: '<rect x="3" y="6" width="18" height="14" rx="2" /><path d="M7 6V4h10v2" />',
  pen: '<path d="M3 17V21h4l11-11-4-4z" />',
  smile:
    '<circle cx="12" cy="12" r="9" /><path d="M9 9v.01M15 9v.01M8 14a5 5 0 0 0 8 0" />',
  frown:
    '<circle cx="12" cy="12" r="9" /><path d="M9 9v.01M15 9v.01M8 16a5 5 0 0 1 8 0" />',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />',
  'eye-off':
    '<path d="M3 3l18 18" /><path d="M10.6 6.1A10 10 0 0 1 12 6c6 0 10 7 10 7a14 14 0 0 1-2.4 3.1" /><path d="M6.7 6.7A14 14 0 0 0 2 12s4 7 10 7a10 10 0 0 0 4.5-1" /><path d="M9.9 14.1A3 3 0 0 1 9 12a3 3 0 0 1 3-3 3 3 0 0 1 2.1.9" />',
  'check-circle': '<circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" />',
  // Drag handle: 6 dots in 2 cols × 3 rows. Use 1.6 radius to read at 12-16px.
  drag: '<circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />',
  scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />',
  wifi: '<path d="M2 9.5a15 15 0 0 1 20 0" /><path d="M5 13a10 10 0 0 1 14 0" /><path d="M8.5 16.5a5 5 0 0 1 7 0" /><path d="M12 20h.01" />',
  'wifi-off':
    '<path d="m3 3 18 18" /><path d="M12 20h.01" /><path d="M8.5 16.5a5 5 0 0 1 7 0" /><path d="M5 13a10 10 0 0 1 3.5-2.3" /><path d="M11 8.6A10 10 0 0 1 19 13" /><path d="M2 9.5a15 15 0 0 1 5.7-3.2" /><path d="M11.6 5.6A15 15 0 0 1 22 9.5" />',
} as const;

/** Built-in DS icon names. Consumers can extend the runtime set via `provideDsIcons({...})` —
 * the type widens to `string` so any custom name is accepted at the call site (at the cost of
 * autocomplete for those custom names). */
export type IconName = keyof typeof ICONS | (string & {});
