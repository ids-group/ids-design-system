// Docs TOC config — flat list of links per group, matching every
// data-anchor registered in docs.page.ts. Items within each group are sorted
// A→Z by label; the rendering order in docs.page.ts mirrors this so the
// sidenav reads top-to-bottom like the page (scroll-spy highlight stays
// monotonic). Start/Reference have a single item each.

export interface NavItem {
  label: string;
  anchor: string;
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
      { label: 'Avatars', anchor: 'avatar' },
      { label: 'Badges, tags & status', anchor: 'badge' },
      { label: 'Banner', anchor: 'banner' },
      { label: 'Bottom sheet', anchor: 'bottom-sheet' },
      { label: 'Breadcrumbs', anchor: 'breadcrumbs' },
      { label: 'Buttons', anchor: 'button' },
      { label: 'Cards', anchor: 'card' },
      { label: 'Combobox', anchor: 'combobox' },
      { label: 'Date picker', anchor: 'date-picker' },
      { label: 'Drawer', anchor: 'drawer' },
      { label: 'Dropzone', anchor: 'dropzone' },
      { label: 'Empty state', anchor: 'empty-state' },
      { label: 'Fields', anchor: 'input' },
      { label: 'Icon', anchor: 'icon' },
      { label: 'Icon button', anchor: 'icon-button' },
      { label: 'Link', anchor: 'link' },
      { label: 'Menu', anchor: 'menu' },
      { label: 'Modal', anchor: 'modal' },
      { label: 'Number stepper', anchor: 'number-stepper' },
      { label: 'Page footer', anchor: 'page-footer' },
      { label: 'Page header', anchor: 'page-header' },
      { label: 'Pagination', anchor: 'pagination' },
      { label: 'Popover', anchor: 'popover' },
      { label: 'Progress', anchor: 'progress' },
      { label: 'Search', anchor: 'search' },
      { label: 'Select', anchor: 'select' },
      { label: 'Selection', anchor: 'selection' },
      { label: 'Sidenav', anchor: 'sidenav' },
      { label: 'Skeleton', anchor: 'skeleton' },
      { label: 'Spinner', anchor: 'spinner' },
      { label: 'Stats', anchor: 'stat' },
      { label: 'Status dots', anchor: 'status-dot' },
      { label: 'Stepper', anchor: 'stepper' },
      { label: 'Table', anchor: 'table' },
      { label: 'Tabs', anchor: 'tabs' },
      { label: 'Tag', anchor: 'tag' },
      { label: 'Toast', anchor: 'toast' },
      { label: 'Tooltip', anchor: 'tooltip' },
      { label: 'Top bar', anchor: 'topbar' },
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
      { label: 'Motion', anchor: 'motion' },
      { label: 'Opacity', anchor: 'opacity' },
      { label: 'Radius', anchor: 'radius' },
      { label: 'Scrollbar', anchor: 'scrollbar' },
      { label: 'Spacing', anchor: 'spacing' },
      { label: 'Surface levels', anchor: 'surface-levels' },
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
