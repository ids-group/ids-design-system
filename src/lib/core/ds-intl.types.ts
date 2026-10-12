export type DsIntlStepState = 'error' | 'completed' | 'current' | 'upcoming';
export type DsIntlSortDirection = 'asc' | 'desc' | null;

/** Every string the library invents, grouped by the component that renders it. A function member
 *  receives the parts that vary and returns the whole phrase, so word order is the translator's. */
export interface DsIntl {
  readonly field: {
    /** `'(optional)'` - input, textarea, select, multi-select, autocomplete, date-picker, time-picker. */
    readonly optional: string;
    /** `'Clear input'` - input. */
    readonly clearInput: string;
    /** `'Show password'` - input. */
    readonly showPassword: string;
    /** `'Hide password'` - input. */
    readonly hidePassword: string;
    /** `'1 character over the limit'` / `` `${excess} characters over the limit` `` - textarea
     *  `maxLengthMode="soft"`. */
    readonly overLimit: (excess: number) => string;
    /** `'Changed'` - the mark of a field under `showDirty` whose value was edited. */
    readonly changed?: string;
  };
  readonly picker: {
    /** `'Select…'` - autocomplete, multi-select `placeholder` default. */
    readonly placeholder: string;
    /** `'Filter…'` - multi-select `searchPlaceholder` default. */
    readonly filterPlaceholder: string;
    /** `'Clear selection'` - autocomplete, multi-select, select. */
    readonly clearSelection: string;
    /** `'No matches'` - autocomplete, multi-select (fallback of `dsEmptyTemplate`). */
    readonly noMatches: string;
    /** `'No options'` - select (fallback of its empty template). */
    readonly noOptions: string;
    /** `'Select all'` - multi-select. */
    readonly selectAll: string;
    /** `` `All of ${group}` `` - multi-select. */
    readonly selectAllInGroup: (group: string) => string;
    /** `` `Create «${query}»` `` - autocomplete (fallback of `dsCreateTemplate`). */
    readonly create: (query: string) => string;
    /** `` `+${count} more` `` - multi-select, autocomplete. */
    readonly moreChips: (count: number) => string;
    /** `` `Remove ${label}` `` - multi-select, autocomplete. */
    readonly removeChip: (label: string) => string;
    /** `'selected'` - multi-select compact trigger badge `countLabel`. */
    readonly selectedNoun: string;
    /** `'No results'` / `'1 result'` / `` `${n} results` `` - picker live region. */
    readonly resultCount: (count: number) => string;
  };
  readonly datePicker: {
    readonly placeholder: string;
    readonly openCalendar: string;
    readonly selectMonth: string;
    readonly selectYear: string;
    readonly previousYears: string;
    readonly nextYears: string;
    readonly previousMonth: string;
    readonly nextMonth: string;
    readonly invalidDate: (mask: string) => string;
  };
  readonly timePicker: {
    /** `'Select time'` - trigger name fallback. */
    readonly selectTime: string;
    readonly rangeStart: (label: string) => string;
    readonly rangeEnd: (label: string) => string;
    readonly clear: string;
    readonly now: string;
    readonly done: string;
    /** `'Time'` - time-columns host group. */
    readonly time: string;
    readonly hours: string;
    readonly minutes: string;
    readonly period: string;
  };
  readonly colorPicker: {
    /** `'Choose colour'` - `ariaLabel` default. */
    readonly label: string;
    readonly saturationBrightness: string;
    readonly hue: string;
    readonly hexValue: string;
    readonly presets: string;
  };
  readonly otpInput: {
    /** `'Verification code'` - `ariaLabel` default. */
    readonly label: string;
    readonly digit: (position: number) => string;
    readonly character: (position: number) => string;
  };
  readonly slider: {
    readonly rangeStart: (label: string) => string;
    readonly rangeEnd: (label: string) => string;
  };
  readonly numberStepper: {
    readonly decrease: string;
    readonly increase: string;
  };
  readonly search: {
    readonly placeholder: string;
    readonly clear: string;
  };
  readonly dropzone: {
    readonly label: string;
    readonly title: string;
    readonly hint: string;
    readonly remove: (fileName: string) => string;
    /** File meta line, keyed by `DropzoneFileState`'s `'uploading' | 'success' | 'error'`. */
    readonly uploading: string;
    readonly success: string;
    readonly error: string;
  };
  readonly passwordRules: {
    readonly pending: string;
    readonly met: string;
    readonly failed: string;
  };
  readonly tag: {
    /** `'Remove'` - `closeLabel` default. */
    readonly remove: string;
  };
  readonly badge: {
    /** `'notifications'` - `countLabel` default. */
    readonly noun: string;
    readonly count: (count: number, noun: string) => string;
    readonly overMax: (max: number, noun: string) => string;
  };
  readonly avatar: {
    readonly online: string;
    readonly offline: string;
    readonly away: string;
    readonly busy: string;
  };
  readonly avatarGroup: {
    readonly more: (count: number) => string;
  };
  readonly descriptionList: {
    readonly copy: string;
    readonly copied: string;
  };
  readonly what3words: {
    readonly copy: (address: string) => string;
  };
  readonly dialog: {
    /** `'Close'` - drawer. */
    readonly close: string;
    /** `'Close dialog'` - modal-card. */
    readonly closeDialog: string;
    /** `'Dismiss'` - alert, banner, toast. */
    readonly dismiss: string;
    /** `'Confirm'` - modal confirm default. */
    readonly confirm: string;
    /** `'Cancel'` - modal confirm default. */
    readonly cancel: string;
    /** `'Type'` - before the bold phrase. */
    readonly typeToConfirmBefore: string;
    /** `'to confirm'` - after it. */
    readonly typeToConfirmAfter: string;
  };
  readonly toast: {
    readonly region: string;
  };
  readonly spinner: {
    readonly label: string;
  };
  readonly breadcrumbs: {
    readonly label: string;
  };
  readonly appLayout: {
    readonly railLabel: string;
  };
  readonly sidenav: {
    readonly expandGroup: (label: string) => string;
    readonly collapseGroup: (label: string) => string;
  };
  readonly sidenavFooter: {
    /** `'Search'` - button, panel label, input label, collapsed button. */
    readonly search: string;
    readonly searchPlaceholder: string;
    readonly clear: string;
    readonly noMatches: (query: string) => string;
    readonly typeToSearch: string;
    readonly alerts: string;
    readonly allCaughtUp: string;
    readonly accountMenu: string;
    readonly account: string;
    readonly signedInAs: (name: string) => string;
    readonly profile: string;
    readonly settings: string;
    readonly help: string;
    readonly signOut: string;
    readonly expand: string;
    readonly collapse: string;
  };
  readonly stepper: {
    readonly label: string;
    readonly step: (
      position: number,
      label: string,
      state: DsIntlStepState,
    ) => string;
  };
  readonly tabs: {
    readonly close: (label: string) => string;
  };
  readonly splitButton: {
    readonly menuLabel: string;
  };
  readonly filterBar: {
    readonly more: string;
    readonly panelLabel: string;
  };
  readonly pagination: {
    readonly label: string;
    readonly previous: string;
    readonly next: string;
    readonly page: (page: number) => string;
    /** `` `Showing ${first}–${last} of ${total}` ``, `'Showing 0 of 0'` for an empty list, which the
     *  pager passes as `(0, 0, 0)` - pager AND `ds-table` `rangeAnnouncement`. */
    readonly range: (first: number, last: number, total: number) => string;
    readonly perPage: (size: number) => string;
    readonly rowsPerPage: string;
  };
  readonly table: {
    /** `'Actions'` - utility header. */
    readonly actions: string;
    readonly actionsFor: (row: string) => string;
    readonly filterColumn: (column: string) => string;
    readonly resizeColumn: (column: string) => string;
    readonly narrowColumn: (column: string) => string;
    readonly widenColumn: (column: string) => string;
    readonly fitColumn: (column: string) => string;
    readonly fit: string;
    readonly selectRow: (row: string) => string;
    readonly expandRow: string;
    readonly collapseRow: string;
    /** `'Filter values'` - filter panel label. */
    readonly filterValues: string;
    readonly filterSearch: string;
    readonly emptyValue: string;
    readonly noMatches: string;
    /** `` `${n} selected` `` - filter footer AND bulk bar. */
    readonly selectedCount: (count: number) => string;
    readonly clear: string;
    readonly loading: string;
    /** `sortAnnouncement` default. */
    readonly sorted: (label: string, direction: DsIntlSortDirection) => string;
    readonly rowsExpanded: (count: number) => string;
    readonly selectAllRows: (onThisPage: boolean) => string;
    readonly expandAllRows: (onThisPage: boolean) => string;
    readonly collapseAllRows: (onThisPage: boolean) => string;
  };
  readonly tableColumns: {
    readonly title: string;
    readonly panelLabel: string;
    readonly moveUp: string;
    readonly moveDown: string;
    readonly reset: string;
    readonly trigger: string;
  };
  readonly tableExport: {
    readonly button: string;
    readonly buttonBusy: string;
    readonly preparing: string;
    readonly ready: string;
    readonly failed: string;
  };
  readonly chart: {
    readonly empty: string;
    readonly error: string;
    /** `'Chart'` - accessible-name fallback, 6 charts. */
    readonly title: string;
    /** `'Unpin'` - 5 charts. */
    readonly unpin: string;
    /** `'Data table'` - disclosure summary. */
    readonly dataTable: string;
    readonly dataTableCaption: string;
    readonly legendAll: string;
    readonly legendNone: string;
    readonly labelColumn: string;
    readonly valueColumn: string;
    readonly shareColumn: string;
    readonly seriesColumn: string;
    readonly categoryColumn: string;
    readonly shareOfTotal: (share: string) => string;
    /** `'Other'` - pie `otherLabel` default. */
    readonly other: string;
    /** `'All series are hidden'` - line `noVisibleSeriesText` default. */
    readonly noVisibleSeries: string;
    readonly target: (value: string) => string;
    /** `'Rows under {label}'` - name of a bar-chart group's disclosure button. */
    readonly rowsUnder: (label: string) => string;
    readonly noted: (notes: readonly string[]) => string;
    readonly noData: (label: string) => string;
    readonly onePoint: (label: string, value: string, at: string) => string;
    readonly range: (
      label: string,
      count: number,
      lowest: string,
      highest: string,
    ) => string;
    readonly trendRisingThroughout: string;
    readonly trendFallingThroughout: string;
    readonly trendRisingOverall: string;
    readonly trendFallingOverall: string;
    readonly trendFlat: string;
    readonly extremes: (
      highestLabel: string,
      highest: string,
      lowestLabel: string,
      lowest: string,
    ) => string;
    readonly tableFollows: string;
    readonly threshold: string;
    readonly thresholdAbove: (
      name: string,
      value: string,
      count: number,
      total: number,
    ) => string;
    readonly thresholdInside: (
      name: string,
      low: string,
      high: string,
      count: number,
      total: number,
    ) => string;
    readonly funnelCaption: string;
    readonly stageColumn: string;
    readonly percentColumn: string;
    readonly dropColumn: string;
    readonly fellAway: (drop: string) => string;
    readonly noReading: string;
    readonly heatmapTitle: string;
    readonly heatmapSummary: (
      title: string,
      rows: number,
      columns: number,
      lowest: string,
      highest: string,
    ) => string;
    readonly scatterTitle: string;
    readonly scatterAxis: (axis: string, from: string, to: string) => string;
    readonly scatterSummary: (
      title: string,
      count: number,
      axes: string,
      dropped: number,
    ) => string;
    /** The visible status line while points are thinned out. */
    readonly scatterThinned: (count: number) => string;
    /** `'Waterfall chart'` - name of an empty waterfall. */
    readonly waterfallTitle: string;
    /** `'Waterfall'` - prefix of the spoken summary. */
    readonly waterfallCaption: string;
    readonly increase: string;
    readonly decrease: string;
    readonly total: string;
    readonly stepColumn: string;
    readonly directionColumn: string;
    readonly runningTotalColumn: string;
    readonly endsAt: (value: string) => string;
    /** The pill over a dragged range of categories: their names, the readings' sum and mean.
     *  Unset, the English default. */
    readonly rangeTotal?: (
      range: string,
      total: string,
      average: string,
    ) => string;
  };
}

/** What `provideDsIntl` takes: any section, any subset of its keys. */
export type DsIntlOverrides = {
  [Section in keyof DsIntl]?: Partial<DsIntl[Section]>;
};
