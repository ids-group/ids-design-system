// Docs TOC config — flat list of links per group, matching every
// data-anchor registered in docs.page.ts. Items within each group are sorted
// A→Z by label; the rendering order in docs.page.ts mirrors this so the
// sidenav reads top-to-bottom like the page (scroll-spy highlight stays
// monotonic). Start/Reference have a single item each.

export interface NavItem {
  label: string;
  anchor: string;
  /** Flags a recently-added component — the sidebar renders a "new" chip. */
  new?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    title: 'Start',
    items: [{ label: 'Start here', anchor: 'home' }],
  },
  {
    title: 'Components',
    items: [
      { label: 'Accordion', anchor: 'accordion' },
      { label: 'Alert', anchor: 'alert', new: true },
      { label: 'Avatars', anchor: 'avatar' },
      { label: 'Badges, tags & status', anchor: 'badge' },
      { label: 'Banner', anchor: 'banner' },
      { label: 'Bottom sheet', anchor: 'bottom-sheet' },
      { label: 'Breadcrumbs', anchor: 'breadcrumbs' },
      { label: 'Buttons', anchor: 'button' },
      { label: 'Buttons · group & segmented', anchor: 'segmented', new: true },
      { label: 'Buttons · icon', anchor: 'icon-button' },
      { label: 'Buttons · split', anchor: 'split-button', new: true },
      { label: 'Cards', anchor: 'card' },
      { label: 'Checkbox', anchor: 'checkbox' },
      { label: 'Color picker', anchor: 'color-picker', new: true },
      { label: 'Autocomplete', anchor: 'autocomplete' },
      { label: 'Date picker', anchor: 'date-picker' },
      { label: 'Description list', anchor: 'description-list', new: true },
      { label: 'Drawer', anchor: 'drawer' },
      { label: 'Dropdown', anchor: 'dropdown' },
      { label: 'Dropzone', anchor: 'dropzone' },
      { label: 'Empty state', anchor: 'empty-state' },
      { label: 'Icon', anchor: 'icon' },
      { label: 'Input', anchor: 'input' },
      { label: 'Link', anchor: 'link' },
      { label: 'List', anchor: 'list', new: true },
      { label: 'Loading overlay', anchor: 'loading-overlay', new: true },
      { label: 'Menu', anchor: 'menu' },
      { label: 'Modal', anchor: 'modal' },
      { label: 'Multi-select', anchor: 'multi-select', new: true },
      { label: 'Number stepper', anchor: 'number-stepper' },
      { label: 'OTP input', anchor: 'otp-input', new: true },
      { label: 'Page footer', anchor: 'page-footer' },
      { label: 'Page header', anchor: 'page-header' },
      { label: 'Pagination', anchor: 'pagination' },
      { label: 'Popover', anchor: 'popover' },
      { label: 'Progress', anchor: 'progress' },
      { label: 'Radio', anchor: 'radio' },
      { label: 'Search', anchor: 'search' },
      { label: 'Select', anchor: 'select' },
      { label: 'Sidenav', anchor: 'sidenav' },
      { label: 'Skeleton', anchor: 'skeleton' },
      { label: 'Slider', anchor: 'slider', new: true },
      { label: 'Spinner', anchor: 'spinner' },
      { label: 'Stats', anchor: 'stat' },
      { label: 'Status dots', anchor: 'status-dot' },
      { label: 'Stepper', anchor: 'stepper' },
      { label: 'Switch', anchor: 'switch' },
      { label: 'Table', anchor: 'table' },
      { label: 'Tabs', anchor: 'tabs' },
      { label: 'Tag', anchor: 'tag' },
      { label: 'Textarea', anchor: 'textarea' },
      { label: 'Time picker', anchor: 'time-picker', new: true },
      { label: 'Timeline', anchor: 'timeline', new: true },
      { label: 'Toast', anchor: 'toast' },
      { label: 'Tooltip', anchor: 'tooltip' },
      { label: 'Top bar', anchor: 'topbar' },
      { label: 'Tree view', anchor: 'tree', new: true },
      { label: 'w3w', anchor: 'w3w' },
    ],
  },
  {
    title: 'Foundations',
    items: [
      { label: 'Borders', anchor: 'borders' },
      { label: 'Browser tab', anchor: 'browser-tab' },
      { label: 'Charts', anchor: 'charts' },
      { label: 'Color', anchor: 'color' },
      { label: 'Density', anchor: 'density' },
      { label: 'Elevation', anchor: 'elevation' },
      { label: 'Icons', anchor: 'icons' },
      { label: 'Layout', anchor: 'layout' },
      { label: 'Layout primitives', anchor: 'layout-primitives', new: true },
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
    items: [
      { label: "Do / Don't", anchor: 'practice-do-dont' },
      { label: 'Token Discipline', anchor: 'practice-token-discipline' },
    ],
  },
  {
    title: 'Reference',
    items: [{ label: 'Tokens reference', anchor: 'tokens-reference' }],
  },
];
