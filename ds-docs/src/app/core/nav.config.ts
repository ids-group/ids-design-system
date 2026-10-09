// Docs TOC config — one entry per `data-anchor` on the group's section components. Items sort A→Z except Reference
// (token-reading order); group-pages.ts render order mirrors this so the sidenav/scroll-spy stay monotonic.

export interface NavItem {
  label: string;
  anchor: string;
  /** Flags a recently-added component — the sidebar renders a "new" chip. */
  new?: boolean;
}

export interface NavGroup {
  title: string;
  /** Route this group's page lives at (e.g. 'components/actions', 'home'). */
  path: string;
  /** Marks a group whose items are components — summed for the home component count. */
  kind?: 'component';
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    title: 'Start',
    path: '',
    items: [{ label: 'Start here', anchor: 'home' }],
  },
  {
    title: 'Actions',
    path: 'components/actions',
    kind: 'component',
    items: [
      { label: 'Buttons', anchor: 'button' },
      { label: 'Buttons · icon', anchor: 'icon-button' },
      { label: 'Buttons · toggle', anchor: 'toggle-button' },
      { label: 'Buttons · split', anchor: 'split-button' },
      { label: 'Buttons · group & segmented', anchor: 'segmented' },
      { label: 'Link', anchor: 'link' },
    ],
  },
  {
    title: 'Forms & inputs',
    path: 'components/forms-inputs',
    kind: 'component',
    items: [
      { label: 'Autocomplete', anchor: 'autocomplete' },
      { label: 'Checkbox', anchor: 'checkbox' },
      { label: 'Color picker', anchor: 'color-picker' },
      { label: 'Date picker', anchor: 'date-picker' },
      { label: 'Dropzone', anchor: 'dropzone' },
      { label: 'Field group', anchor: 'field-group' },
      { label: 'Input', anchor: 'input' },
      { label: 'Multi-select', anchor: 'multi-select' },
      { label: 'Number stepper', anchor: 'number-stepper' },
      { label: 'OTP input', anchor: 'otp-input' },
      { label: 'Password rules', anchor: 'password-rules' },
      { label: 'Radio', anchor: 'radio' },
      { label: 'Search', anchor: 'search' },
      { label: 'Select', anchor: 'select' },
      { label: 'Slider', anchor: 'slider' },
      { label: 'Switch', anchor: 'switch' },
      { label: 'Textarea', anchor: 'textarea' },
      { label: 'Time picker', anchor: 'time-picker' },
      { label: 'w3w', anchor: 'w3w' },
    ],
  },
  {
    title: 'Navigation',
    path: 'components/navigation',
    kind: 'component',
    items: [
      { label: 'App layout', anchor: 'app-layout' },
      { label: 'Auth layout', anchor: 'auth-layout' },
      { label: 'Breadcrumbs', anchor: 'breadcrumbs' },
      { label: 'Menu', anchor: 'menu' },
      { label: 'Pagination', anchor: 'pagination' },
      { label: 'Sidenav', anchor: 'sidenav' },
      { label: 'Stepper', anchor: 'stepper' },
      { label: 'Tabs', anchor: 'tabs' },
      { label: 'Top bar', anchor: 'topbar' },
    ],
  },
  {
    title: 'Data display',
    path: 'components/data-display',
    kind: 'component',
    items: [
      { label: 'Accordion', anchor: 'accordion' },
      { label: 'Avatars', anchor: 'avatar' },
      { label: 'Cards', anchor: 'card' },
      { label: 'Description list', anchor: 'description-list' },
      { label: 'Icon', anchor: 'icon' },
      { label: 'List', anchor: 'list' },
      { label: 'Stats', anchor: 'stat' },
      { label: 'Table', anchor: 'table' },
      { label: 'Tag', anchor: 'tag' },
      { label: 'Timeline', anchor: 'timeline' },
      { label: 'Tree view', anchor: 'tree' },
    ],
  },
  {
    title: 'Feedback & status',
    path: 'components/feedback-status',
    kind: 'component',
    items: [
      { label: 'Alert', anchor: 'alert' },
      { label: 'Badge', anchor: 'badge' },
      { label: 'Banner', anchor: 'banner' },
      { label: 'Bar', anchor: 'bar' },
      { label: 'Empty state', anchor: 'empty-state' },
      { label: 'Loading overlay', anchor: 'loading-overlay' },
      { label: 'Skeleton', anchor: 'skeleton' },
      { label: 'Spinner', anchor: 'spinner' },
      { label: 'Status dots', anchor: 'status-dot' },
      { label: 'Toast', anchor: 'toast' },
    ],
  },
  {
    title: 'Overlays',
    path: 'components/overlays',
    kind: 'component',
    items: [
      { label: 'Bottom sheet', anchor: 'bottom-sheet' },
      { label: 'Drawer', anchor: 'drawer' },
      { label: 'Modal', anchor: 'modal' },
      { label: 'Popover', anchor: 'popover' },
      { label: 'Tooltip', anchor: 'tooltip' },
    ],
  },
  {
    title: 'Page structure',
    path: 'components/page-structure',
    kind: 'component',
    items: [
      { label: 'Filter bar', anchor: 'filter-bar' },
      { label: 'Page footer', anchor: 'page-footer' },
      { label: 'Page header', anchor: 'page-header' },
    ],
  },
  {
    title: 'Charts',
    path: 'charts',
    kind: 'component',
    items: [
      { label: 'Bar chart', anchor: 'bar-chart' },
      { label: 'Chart container', anchor: 'chart' },
      { label: 'Column chart', anchor: 'column-chart' },
      { label: 'Pie chart', anchor: 'pie-chart' },
      { label: 'Funnel chart', anchor: 'funnel-chart' },
      { label: 'Heat map', anchor: 'heatmap-chart' },
      { label: 'Line chart', anchor: 'line-chart' },
      { label: 'Scatter chart', anchor: 'scatter-chart' },
      { label: 'Sparkline', anchor: 'sparkline' },
      { label: 'Waterfall chart', anchor: 'waterfall-chart' },
    ],
  },
  {
    title: 'Foundations',
    path: 'foundations',
    items: [
      { label: 'Accessibility', anchor: 'accessibility' },
      { label: 'Borders', anchor: 'borders' },
      { label: 'Browser tab', anchor: 'browser-tab' },
      { label: 'Charts', anchor: 'charts' },
      { label: 'Color', anchor: 'color' },
      { label: 'Density', anchor: 'density' },
      { label: 'Elevation', anchor: 'elevation' },
      { label: 'Icons', anchor: 'icons' },
      { label: 'Layout', anchor: 'layout' },
      { label: 'Layout primitives', anchor: 'layout-primitives' },
      { label: 'Motion', anchor: 'motion' },
      { label: 'Opacity', anchor: 'opacity' },
      { label: 'Radius', anchor: 'radius' },
      { label: 'Scrollbar', anchor: 'scrollbar' },
      { label: 'Spacing', anchor: 'spacing' },
      { label: 'Surface levels', anchor: 'surface-levels' },
      { label: 'Theming', anchor: 'theming' },
      { label: 'Typography', anchor: 'typography' },
      { label: 'Z-index', anchor: 'z-index' },
    ],
  },
  {
    title: 'Patterns',
    path: 'patterns',
    items: [
      { label: 'Page composition', anchor: 'pattern-page-composition' },
      { label: 'Activity', anchor: 'pattern-activity' },
      { label: 'Empty states', anchor: 'pattern-empty-state' },
      { label: 'Filter Bar', anchor: 'pattern-filter-bar' },
      { label: 'Form Layout', anchor: 'pattern-form-layout' },
      { label: 'Page Header', anchor: 'pattern-page-header' },
    ],
  },
  {
    title: 'Practice',
    path: 'practice',
    items: [
      { label: 'Composition rules', anchor: 'practice-rules' },
      { label: "Do / Don't", anchor: 'practice-do-dont' },
      { label: 'Token Discipline', anchor: 'practice-token-discipline' },
      { label: 'Signal Forms', anchor: 'practice-signal-forms' },
      { label: 'Claude Design sync', anchor: 'practice-claude-design' },
    ],
  },
  {
    title: 'Reference',
    path: 'reference',
    items: [
      { label: 'Tokens reference', anchor: 'tokens-reference' },
      { label: 'Semantic tokens', anchor: 'semantic-tokens' },
      { label: 'Palette', anchor: 'palette' },
      { label: 'Typography', anchor: 'typography-tokens' },
      { label: 'Spacing', anchor: 'spacing-tokens' },
      { label: 'Radius', anchor: 'radius-tokens' },
      { label: 'Elevation', anchor: 'elevation-tokens' },
      { label: 'Motion', anchor: 'motion-tokens' },
      { label: 'Density', anchor: 'density-tokens' },
      { label: 'Layout', anchor: 'layout-tokens' },
      { label: 'Icons', anchor: 'icons-tokens' },
      { label: 'Misc', anchor: 'misc-tokens' },
      { label: 'Charts', anchor: 'charts-tokens' },
      { label: 'Component tokens', anchor: 'component-tokens' },
    ],
  },
  {
    title: 'Changelog',
    path: 'changelog',
    items: [{ label: 'Changelog', anchor: 'changelog' }],
  },
];

// ---- URL <-> group resolution ----------------------------------------------
// URLs are flat `/<area>/<anchor>` (e.g. /components/button, /foundations/color)
// — the group name (actions/forms-inputs/…) never appears. Home is `/` and
// changelog `/changelog` (single-section pages carry no anchor segment).

const GROUP_BY_ANCHOR = new Map<string, NavGroup>();
for (const group of NAV) {
  const area = group.path.split('/')[0];
  for (const item of group.items) {
    GROUP_BY_ANCHOR.set(`${area}/${item.anchor}`, group);
  }
}

/** URL area segment for a group path ('components/actions' -> 'components'). */
export function areaOfPath(path: string): string {
  return path.split('/')[0];
}

/** The nav group that owns `anchor` within `area`, or undefined. */
export function groupForAnchor(
  area: string,
  anchor: string,
): NavGroup | undefined {
  return GROUP_BY_ANCHOR.get(`${area}/${anchor}`);
}

/** First anchor of the group living at `path`. */
export function firstAnchorOfPath(path: string): string {
  return NAV.find((group) => group.path === path)?.items[0]?.anchor ?? '';
}

/** Router URL for a group's landing (its first section). */
export function urlForGroupPath(path: string): string {
  if (path === '' || path === 'changelog') {
    return `/${path}`;
  }

  return `/${areaOfPath(path)}/${firstAnchorOfPath(path)}`;
}

/** Router URL for a specific anchor inside its group. */
export function urlForAnchor(groupPath: string, anchor: string): string {
  if (groupPath === '' || groupPath === 'changelog') {
    return `/${groupPath}`;
  }

  return `/${areaOfPath(groupPath)}/${anchor}`;
}
