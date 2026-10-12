import type { DsIntl } from './ds-intl.types';

/** English wording for every string the library invents. Used unless `provideDsIntl` overrides
 *  a section. */
export const DS_INTL_DEFAULTS: DsIntl & {
  readonly field: Required<DsIntl['field']>;
  readonly chart: Required<DsIntl['chart']>;
} = {
  field: {
    optional: '(optional)',
    clearInput: 'Clear input',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    overLimit: (excess) =>
      excess === 1
        ? '1 character over the limit'
        : `${excess} characters over the limit`,
    changed: 'Changed',
  },
  picker: {
    placeholder: 'Select…',
    filterPlaceholder: 'Filter…',
    clearSelection: 'Clear selection',
    noMatches: 'No matches',
    noOptions: 'No options',
    selectAll: 'Select all',
    selectAllInGroup: (group) => `All of ${group}`,
    create: (query) => `Create «${query}»`,
    moreChips: (count) => `+${count} more`,
    removeChip: (label) => `Remove ${label}`,
    selectedNoun: 'selected',
    resultCount: (count) =>
      count === 0
        ? 'No results'
        : count === 1
          ? '1 result'
          : `${count} results`,
  },
  datePicker: {
    placeholder: 'Select date',
    openCalendar: 'Choose date',
    selectMonth: 'Select month',
    selectYear: 'Select year',
    previousYears: 'Previous years',
    nextYears: 'Next years',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    invalidDate: (mask) => `Enter a valid date (${mask})`,
  },
  timePicker: {
    selectTime: 'Select time',
    rangeStart: (label) => `${label} (from)`,
    rangeEnd: (label) => `${label} (to)`,
    clear: 'Clear',
    now: 'Now',
    done: 'Done',
    time: 'Time',
    hours: 'Hours',
    minutes: 'Minutes',
    period: 'AM/PM',
  },
  colorPicker: {
    label: 'Choose colour',
    saturationBrightness:
      'Saturation and brightness — use arrow keys to adjust',
    hue: 'Hue',
    hexValue: 'Hex colour value',
    presets: 'Preset colours',
  },
  otpInput: {
    label: 'Verification code',
    digit: (position) => `Digit ${position}`,
    character: (position) => `Character ${position}`,
  },
  slider: {
    rangeStart: (label) => (label ? `${label} minimum` : 'Minimum'),
    rangeEnd: (label) => (label ? `${label} maximum` : 'Maximum'),
  },
  numberStepper: {
    decrease: 'Decrease',
    increase: 'Increase',
  },
  search: {
    placeholder: 'Search',
    clear: 'Clear search',
  },
  dropzone: {
    label: 'Upload files',
    title: 'Drop files here',
    hint: 'or click to browse',
    remove: (fileName) => `Remove ${fileName}`,
    uploading: 'uploading',
    success: 'success',
    error: 'error',
  },
  passwordRules: {
    pending: 'not yet met',
    met: 'met',
    failed: 'not met',
  },
  tag: {
    remove: 'Remove',
  },
  badge: {
    noun: 'notifications',
    count: (count, noun) => `${count} ${noun}`,
    overMax: (max, noun) => `More than ${max} ${noun}`,
  },
  avatar: {
    online: 'Online',
    offline: 'Offline',
    away: 'Away',
    busy: 'Busy',
  },
  avatarGroup: {
    more: (count) => `${count} more`,
  },
  descriptionList: {
    copy: 'Copy value',
    copied: 'Copied',
  },
  what3words: {
    copy: (address) => `Copy what3words address ${address}`,
  },
  dialog: {
    close: 'Close',
    closeDialog: 'Close dialog',
    dismiss: 'Dismiss',
    confirm: 'Confirm',
    cancel: 'Cancel',
    typeToConfirmBefore: 'Type',
    typeToConfirmAfter: 'to confirm',
  },
  toast: {
    region: 'Notifications',
  },
  spinner: {
    label: 'Loading',
  },
  breadcrumbs: {
    label: 'Breadcrumb',
  },
  appLayout: {
    railLabel: 'Navigation',
  },
  sidenav: {
    expandGroup: (label) => `Expand ${label}`,
    collapseGroup: (label) => `Collapse ${label}`,
  },
  sidenavFooter: {
    search: 'Search',
    searchPlaceholder: 'Search…',
    clear: 'Clear',
    noMatches: (query) => `No matches for “${query}”.`,
    typeToSearch: 'Type to search.',
    alerts: 'Alerts',
    allCaughtUp: 'You’re all caught up.',
    accountMenu: 'Account menu',
    account: 'Account',
    signedInAs: (name) => `Signed in as ${name}`,
    profile: 'Your profile',
    settings: 'Account settings',
    help: 'Help & support',
    signOut: 'Sign out',
    expand: 'Expand',
    collapse: 'Collapse',
  },
  stepper: {
    label: 'Progress',
    step: (position, label, state) => `Step ${position}: ${label} (${state})`,
  },
  tabs: {
    close: (label) => `Close ${label}`,
  },
  splitButton: {
    menuLabel: 'More actions',
  },
  filterBar: {
    more: 'more',
    panelLabel: 'More filters',
  },
  pagination: {
    label: 'Pagination',
    previous: 'Previous page',
    next: 'Next page',
    page: (page) => `Page ${page}`,
    range: (first, last, total) =>
      total === 0 ? 'Showing 0 of 0' : `Showing ${first}–${last} of ${total}`,
    perPage: (size) => `${size} per page`,
    rowsPerPage: 'Rows per page',
  },
  table: {
    actions: 'Actions',
    actionsFor: (row) => `Actions for ${row}`,
    filterColumn: (column) => `Filter ${column}`,
    resizeColumn: (column) => `Resize ${column}`,
    narrowColumn: (column) => `Narrow ${column}`,
    widenColumn: (column) => `Widen ${column}`,
    fitColumn: (column) => `Fit ${column} to its content`,
    fit: 'Fit',
    selectRow: (row) => `Select ${row}`,
    expandRow: 'Expand row',
    collapseRow: 'Collapse row',
    filterValues: 'Filter values',
    filterSearch: 'Search…',
    emptyValue: '(empty)',
    noMatches: 'No matches',
    selectedCount: (count) => `${count} selected`,
    clear: 'Clear',
    loading: 'Loading…',
    sorted: (label, direction) =>
      direction
        ? `Sorted by ${label}, ${direction === 'asc' ? 'ascending' : 'descending'}`
        : 'Sorting cleared',
    rowsExpanded: (count) => `${count} rows expanded`,
    selectAllRows: (onThisPage) =>
      onThisPage ? 'Select all rows on this page' : 'Select all rows',
    expandAllRows: (onThisPage) =>
      `Expand all rows${onThisPage ? ' on this page' : ''}`,
    collapseAllRows: (onThisPage) =>
      `Collapse all rows${onThisPage ? ' on this page' : ''}`,
  },
  tableColumns: {
    title: 'Columns',
    panelLabel: 'Column visibility',
    moveUp: 'Move up',
    moveDown: 'Move down',
    reset: 'Reset to default',
    trigger: 'Choose columns',
  },
  tableExport: {
    button: 'Export CSV',
    buttonBusy: 'Preparing…',
    preparing: 'Preparing export…',
    ready: 'Export ready',
    failed: 'Export failed',
  },
  chart: {
    empty: 'No data',
    error: 'Could not load the data',
    title: 'Chart',
    unpin: 'Unpin',
    dataTable: 'Data table',
    dataTableCaption: 'Chart data',
    legendAll: 'All',
    legendNone: 'None',
    labelColumn: 'Label',
    valueColumn: 'Value',
    shareColumn: 'Share of total',
    seriesColumn: 'Series',
    categoryColumn: 'Category',
    shareOfTotal: (share) => `${share} of total`,
    other: 'Other',
    noVisibleSeries: 'All series are hidden',
    target: (value) => `Target ${value}`,
    rowsUnder: (label) => `Rows under ${label}`,
    noted: (notes) => `Noted: ${notes.join('; ')}.`,
    noData: (label) => `${label}. No data.`,
    onePoint: (label, value, at) => `${label}, one point: ${value} at ${at}.`,
    range: (label, count, lowest, highest) =>
      `${label}, ${count} points, ${lowest} to ${highest}.`,
    trendRisingThroughout: 'Rising throughout',
    trendFallingThroughout: 'Falling throughout',
    trendRisingOverall: 'Rising overall',
    trendFallingOverall: 'Falling overall',
    trendFlat: 'Ending where it started',
    extremes: (highestLabel, highest, lowestLabel, lowest) =>
      `Highest in ${highestLabel} at ${highest}, lowest in ${lowestLabel} at ${lowest}.`,
    tableFollows: 'Full values in the table below.',
    threshold: 'Threshold',
    thresholdAbove: (name, value, count, total) =>
      `${name} at ${value}, ${count} of ${total} ${total === 1 ? 'point' : 'points'} above.`,
    thresholdInside: (name, low, high, count, total) =>
      `${name} from ${low} to ${high}, ${count} of ${total} ${total === 1 ? 'point' : 'points'} inside.`,
    funnelCaption:
      'Each stage as a percentage of the first, and the drop from the stage above it.',
    stageColumn: 'Stage',
    percentColumn: 'Percent',
    dropColumn: 'Drop',
    fellAway: (drop) => `${drop} fell away since the stage above`,
    noReading: 'No reading',
    heatmapTitle: 'Heat map',
    heatmapSummary: (title, rows, columns, lowest, highest) =>
      `${title}, ${rows} rows by ${columns} columns, readings from ${lowest} to ${highest}.`,
    scatterTitle: 'Scatter chart',
    scatterAxis: (axis, from, to) => `${axis} from ${from} to ${to}`,
    scatterSummary: (title, count, axes, dropped) =>
      `${title}: ${count} readings drawn, ${axes}.${
        dropped > 0
          ? ` ${dropped} further readings were thinned out to keep the plot drawable; the data table lists every one.`
          : ''
      }`,
    scatterThinned: (count) =>
      `${count} readings thinned out to keep the plot drawable - every one is in the data table.`,
    waterfallTitle: 'Waterfall chart',
    waterfallCaption: 'Waterfall',
    increase: 'increase',
    decrease: 'decrease',
    total: 'total',
    stepColumn: 'Step',
    directionColumn: 'Direction',
    runningTotalColumn: 'Running total',
    endsAt: (value) => `Ends at ${value}.`,
    rangeTotal: (range, total, average) =>
      `${range}: ${total} · avg ${average}`,
  },
};
