// Docs TOC config — flat list of links per group, matching every
// data-anchor registered in docs.page.ts. Order mirrors the rendering
// order so the sidenav reads top-to-bottom like the page.

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
    items: [
      { label: 'Welcome',              anchor: 'home' },
    ],
  },
  {
    title: 'Components',
    items: [
      { label: 'Buttons',              anchor: 'button' },
      { label: 'Icon',                 anchor: 'icon' },
      { label: 'Fields',               anchor: 'input' },
      { label: 'Number stepper',       anchor: 'number-stepper' },
      { label: 'Search',               anchor: 'search' },
      { label: 'Select',               anchor: 'select' },
      { label: 'Selection',            anchor: 'selection' },
      { label: 'Date picker',          anchor: 'date-picker' },
      { label: 'Badges, tags & status',anchor: 'badge' },
      { label: 'Status dots',          anchor: 'status-dot' },
      { label: 'Avatars',              anchor: 'avatar' },
      { label: 'Cards',                anchor: 'card' },
      { label: 'Stats',                anchor: 'stat' },
      { label: 'Table',                anchor: 'table' },
      { label: 'Pagination',           anchor: 'pagination' },
      { label: 'Tabs',                 anchor: 'tabs' },
      { label: 'Sidenav',              anchor: 'sidenav' },
      { label: 'Top bar',              anchor: 'topbar' },
      { label: 'Page header',          anchor: 'page-header' },
      { label: 'Page footer',          anchor: 'page-footer' },
      { label: 'Breadcrumbs',          anchor: 'breadcrumbs' },
      { label: 'Modal',                anchor: 'modal' },
      { label: 'Menu',                 anchor: 'menu' },
      { label: 'Banner',               anchor: 'banner' },
      { label: 'Dropzone',             anchor: 'dropzone' },
      { label: 'Empty state',          anchor: 'empty-state' },
      { label: 'Progress',             anchor: 'progress' },
      { label: 'Spinner',              anchor: 'spinner' },
      { label: 'Skeleton',             anchor: 'skeleton' },
      { label: 'Accordion',            anchor: 'accordion' },
      { label: 'Stepper',              anchor: 'stepper' },
      { label: 'Tooltip',              anchor: 'tooltip' },
      { label: 'Popover',              anchor: 'popover' },
      { label: 'Toast',                anchor: 'toast' },
      { label: 'Drawer',               anchor: 'drawer' },
      { label: 'Bottom sheet',         anchor: 'bottom-sheet' },
      { label: 'Tag',                  anchor: 'tag' },
      { label: 'w3w',                  anchor: 'w3w' },
      { label: 'Link',                 anchor: 'link' },
      { label: 'Combobox',             anchor: 'combobox' },
    ],
  },
  {
    title: 'Foundations',
    items: [
      { label: 'Color',                anchor: 'color' },
      { label: 'Typography',           anchor: 'typography' },
      { label: 'Spacing',              anchor: 'spacing' },
      { label: 'Radius',               anchor: 'radius' },
      { label: 'Elevation',            anchor: 'elevation' },
      { label: 'Motion',               anchor: 'motion' },
      { label: 'Density',              anchor: 'density' },
      { label: 'Icons',                anchor: 'icons' },
      { label: 'Layout',               anchor: 'layout' },
      { label: 'Scrollbar',            anchor: 'scrollbar' },
      { label: 'Borders',              anchor: 'borders' },
      { label: 'Opacity',              anchor: 'opacity' },
      { label: 'Surface levels',       anchor: 'surface-levels' },
      { label: 'Z-index',              anchor: 'z-index' },
      { label: 'Browser tab',          anchor: 'browser-tab' },
      { label: 'Charts',               anchor: 'charts' },
    ],
  },
  {
    title: 'Patterns',
    items: [
      { label: 'Page Header',          anchor: 'pattern-page-header' },
      { label: 'Filter Bar',           anchor: 'pattern-filter-bar' },
      { label: 'Form Layout',          anchor: 'pattern-form-layout' },
      { label: 'Activity',             anchor: 'pattern-activity' },
      { label: 'Empty states',         anchor: 'pattern-empty-state' },
    ],
  },
  {
    title: 'Practice',
    items: [
      { label: 'Token Discipline',     anchor: 'practice-token-discipline' },
      { label: "Do / Don't",           anchor: 'practice-do-dont' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { label: 'Tokens reference',     anchor: 'tokens-reference' },
    ],
  },
];
