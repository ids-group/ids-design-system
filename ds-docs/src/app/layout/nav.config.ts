// Docs TOC config — flat list of links per group, matching every
// data-anchor registered in docs.page.ts (Reference items are anchors inside
// the single tokens-reference section). Items within each group are sorted
// A→Z by label, EXCEPT Reference, which follows token-reading order (colour
// first). The rendering order in docs.page.ts mirrors this so the sidenav
// reads top-to-bottom like the page (scroll-spy highlight stays monotonic).

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
    path: 'home',
    items: [{ label: 'Start here', anchor: 'home' }],
  },
  {
    title: 'Actions',
    path: 'components/actions',
    kind: 'component',
    items: [
      { label: 'Buttons', anchor: 'button' },
      { label: 'Buttons · group & segmented', anchor: 'segmented' },
      { label: 'Buttons · icon', anchor: 'icon-button' },
      { label: 'Buttons · split', anchor: 'split-button' },
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
      { label: 'Input', anchor: 'input' },
      { label: 'Multi-select', anchor: 'multi-select' },
      { label: 'Number stepper', anchor: 'number-stepper' },
      { label: 'OTP input', anchor: 'otp-input' },
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
      { label: 'Empty state', anchor: 'empty-state' },
      { label: 'Loading overlay', anchor: 'loading-overlay' },
      { label: 'Progress', anchor: 'progress' },
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
      { label: 'Page footer', anchor: 'page-footer' },
      { label: 'Page header', anchor: 'page-header' },
    ],
  },
  {
    title: 'Foundations',
    path: 'foundations',
    items: [
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
      { label: "Do / Don't", anchor: 'practice-do-dont' },
      { label: 'Token Discipline', anchor: 'practice-token-discipline' },
    ],
  },
  {
    title: 'Reference',
    path: 'reference',
    items: [
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
