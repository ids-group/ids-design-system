import { Type } from '@angular/core';

import { HomeSection } from './sections/home/home.section';

import { ButtonSection } from './sections/components/button/button.section';
import { SegmentedSection } from './sections/components/segmented/segmented.section';
import { IconButtonSection } from './sections/components/icon-button/icon-button.section';
import { SplitButtonSection } from './sections/components/split-button/split-button.section';
import { LinkSection } from './sections/components/link/link.section';

import { AutocompleteSection } from './sections/components/autocomplete/autocomplete.section';
import { CheckboxSection } from './sections/components/checkbox/checkbox.section';
import { ColorPickerSection } from './sections/components/color-picker/color-picker.section';
import { DatePickerSection } from './sections/components/date-picker/date-picker.section';
import { DropzoneSection } from './sections/components/dropzone/dropzone.section';
import { InputSection } from './sections/components/input/input.section';
import { MultiSelectSection } from './sections/components/multi-select/multi-select.section';
import { NumberStepperSection } from './sections/components/number-stepper/number-stepper.section';
import { OtpInputSection } from './sections/components/otp-input/otp-input.section';
import { PasswordRulesSection } from './sections/components/password-rules/password-rules.section';
import { RadioSection } from './sections/components/radio/radio.section';
import { SearchSection } from './sections/components/search/search.section';
import { SelectSection } from './sections/components/select/select.section';
import { SliderSection } from './sections/components/slider/slider.section';
import { SwitchSection } from './sections/components/switch/switch.section';
import { TextareaSection } from './sections/components/textarea/textarea.section';
import { TimePickerSection } from './sections/components/time-picker/time-picker.section';
import { W3wSection } from './sections/components/w3w/w3w.section';

import { AppLayoutSection } from './sections/components/app-layout/app-layout.section';
import { AuthLayoutSection } from './sections/components/auth-layout/auth-layout.section';
import { BreadcrumbsSection } from './sections/components/breadcrumbs/breadcrumbs.section';
import { MenuSection } from './sections/components/menu/menu.section';
import { PaginationSection } from './sections/components/pagination/pagination.section';
import { SidenavSection } from './sections/components/sidenav/sidenav.section';
import { StepperSection } from './sections/components/stepper/stepper.section';
import { TabsSection } from './sections/components/tabs/tabs.section';
import { TopbarSection } from './sections/components/topbar/topbar.section';

import { AccordionSection } from './sections/components/accordion/accordion.section';
import { AvatarSection } from './sections/components/avatar/avatar.section';
import { CardSection } from './sections/components/card/card.section';
import { DescriptionListSection } from './sections/components/description-list/description-list.section';
import { IconSection } from './sections/components/icon/icon.section';
import { ListSection } from './sections/components/list/list.section';
import { StatSection } from './sections/components/stat/stat.section';
import { TableSection } from './sections/components/table/table.section';
import { TagSection } from './sections/components/tag/tag.section';
import { TimelineSection } from './sections/components/timeline/timeline.section';
import { TreeSection } from './sections/components/tree/tree.section';

import { AlertSection } from './sections/components/alert/alert.section';
import { BadgeSection } from './sections/components/badge/badge.section';
import { BannerSection } from './sections/components/banner/banner.section';
import { BarSection } from './sections/components/bar/bar.section';
import { EmptyStateComponentSection } from './sections/components/empty-state/empty-state.section';
import { LoadingOverlaySection } from './sections/components/loading-overlay/loading-overlay.section';
import { SkeletonSection } from './sections/components/skeleton/skeleton.section';
import { SpinnerSection } from './sections/components/spinner/spinner.section';
import { StatusDotSection } from './sections/components/status-dot/status-dot.section';
import { ToastSection } from './sections/components/toast/toast.section';

import { BottomSheetSection } from './sections/components/bottom-sheet/bottom-sheet.section';
import { DrawerSection } from './sections/components/drawer/drawer.section';
import { ModalSection } from './sections/components/modal/modal.section';
import { PopoverSection } from './sections/components/popover/popover.section';
import { TooltipSection } from './sections/components/tooltip/tooltip.section';

import { FieldGroupSection } from './sections/components/field-group/field-group.section';
import { FilterBarSection as ComponentsFilterBarSection } from './sections/components/filter-bar/filter-bar.section';
import { PageFooterSection } from './sections/components/page-footer/page-footer.section';
import { PageHeaderSection as ComponentsPageHeaderSection } from './sections/components/page-header/page-header.section';

import { BarChartSection } from './sections/charts/charts.section';
import { ChartSection } from './sections/charts/chart/chart.section';
import { ColumnChartSection } from './sections/charts/column-chart/column-chart.section';
import { PieChartSection } from './sections/charts/pie-chart/pie-chart.section';
import { FunnelChartSection } from './sections/charts/funnel-chart/funnel-chart.section';
import { HeatmapChartSection } from './sections/charts/heatmap-chart/heatmap-chart.section';
import { LineChartSection } from './sections/charts/line-chart/line-chart.section';
import { SparklineSection } from './sections/charts/sparkline/sparkline.section';
import { ScatterChartSection } from './sections/charts/scatter-chart/scatter-chart.section';
import { WaterfallChartSection } from './sections/charts/waterfall-chart/waterfall-chart.section';

import { BordersSection } from './sections/foundations/borders/borders.section';
import { BrowserTabSection } from './sections/foundations/browser-tab/browser-tab.section';
import { ChartsSection } from './sections/foundations/charts/charts.section';
import { ColorSection } from './sections/foundations/color/color.section';
import { DensitySection } from './sections/foundations/density/density.section';
import { ElevationSection } from './sections/foundations/elevation/elevation.section';
import { IconsSection } from './sections/foundations/icons/icons.section';
import { LayoutSection } from './sections/foundations/layout/layout.section';
import { LayoutPrimitivesSection } from './sections/components/layout-primitives/layout-primitives.section';
import { MotionSection } from './sections/foundations/motion/motion.section';
import { OpacitySection } from './sections/foundations/opacity/opacity.section';
import { RadiusSection } from './sections/foundations/radius/radius.section';
import { ScrollbarSection } from './sections/foundations/scrollbar/scrollbar.section';
import { AccessibilitySection } from './sections/foundations/accessibility/accessibility.section';
import { SpacingSection } from './sections/foundations/spacing/spacing.section';
import { SurfaceLevelsSection } from './sections/foundations/surface-levels/surface-levels.section';
import { ThemingSection } from './sections/foundations/theming/theming.section';
import { TypographySection } from './sections/foundations/typography/typography.section';
import { ZIndexSection } from './sections/foundations/z-index/z-index.section';

import { ActivitySection } from './sections/patterns/activity/activity.section';
import { EmptyStateSection } from './sections/patterns/empty-state/empty-state.section';
import { FilterBarSection as PatternsFilterBarSection } from './sections/patterns/filter-bar/filter-bar.section';
import { FormLayoutSection } from './sections/patterns/form-layout/form-layout.section';
import { ClaudeDesignSection } from './sections/practice/claude-design/claude-design.section';
import { PageCompositionSection } from './sections/patterns/page-composition/page-composition.section';
import { PageHeaderSection as PatternsPageHeaderSection } from './sections/patterns/page-header/page-header.section';

import { DoDontSection } from './sections/practice/do-dont/do-dont.section';
import { TokenDisciplineSection } from './sections/practice/token-discipline/token-discipline.section';
import { SignalFormsSection } from './sections/practice/signal-forms/signal-forms.section';
import { RulesSection } from './sections/practice/rules/rules.section';

import { TokensReferenceSection } from './sections/tokens-reference/tokens-reference.section';
import { ChangelogSection } from './sections/changelog/changelog.section';

export interface GroupPageDef {
  readonly path: string;
  /** Page `<h1>`; omitted for `home` (HomeSection renders its own hero). */
  readonly title?: string;
  readonly sections: readonly Type<unknown>[];
}

export const GROUP_PAGES: readonly GroupPageDef[] = [
  { path: '', sections: [HomeSection] },
  {
    path: 'components/actions',
    title: 'Actions',
    sections: [
      ButtonSection,
      SegmentedSection,
      IconButtonSection,
      SplitButtonSection,
      LinkSection,
    ],
  },
  {
    path: 'components/forms-inputs',
    title: 'Forms & inputs',
    sections: [
      AutocompleteSection,
      CheckboxSection,
      ColorPickerSection,
      DatePickerSection,
      DropzoneSection,
      FieldGroupSection,
      InputSection,
      MultiSelectSection,
      NumberStepperSection,
      OtpInputSection,
      PasswordRulesSection,
      RadioSection,
      SearchSection,
      SelectSection,
      SliderSection,
      SwitchSection,
      TextareaSection,
      TimePickerSection,
      W3wSection,
    ],
  },
  {
    path: 'components/navigation',
    title: 'Navigation',
    sections: [
      AppLayoutSection,
      AuthLayoutSection,
      BreadcrumbsSection,
      MenuSection,
      PaginationSection,
      SidenavSection,
      StepperSection,
      TabsSection,
      TopbarSection,
    ],
  },
  {
    path: 'components/data-display',
    title: 'Data display',
    sections: [
      AccordionSection,
      AvatarSection,
      CardSection,
      DescriptionListSection,
      IconSection,
      ListSection,
      StatSection,
      TableSection,
      TagSection,
      TimelineSection,
      TreeSection,
    ],
  },
  {
    path: 'components/feedback-status',
    title: 'Feedback & status',
    sections: [
      AlertSection,
      BadgeSection,
      BannerSection,
      BarSection,
      EmptyStateComponentSection,
      LoadingOverlaySection,
      SkeletonSection,
      SpinnerSection,
      StatusDotSection,
      ToastSection,
    ],
  },
  {
    path: 'components/overlays',
    title: 'Overlays',
    sections: [
      BottomSheetSection,
      DrawerSection,
      ModalSection,
      PopoverSection,
      TooltipSection,
    ],
  },
  {
    path: 'components/page-structure',
    title: 'Page structure',
    sections: [
      ComponentsFilterBarSection,
      PageFooterSection,
      ComponentsPageHeaderSection,
    ],
  },
  {
    path: 'charts',
    title: 'Charts',
    sections: [
      BarChartSection,
      ChartSection,
      ColumnChartSection,
      PieChartSection,
      FunnelChartSection,
      HeatmapChartSection,
      LineChartSection,
      ScatterChartSection,
      SparklineSection,
      WaterfallChartSection,
    ],
  },
  {
    path: 'foundations',
    title: 'Foundations',
    sections: [
      AccessibilitySection,
      BordersSection,
      BrowserTabSection,
      ChartsSection,
      ColorSection,
      DensitySection,
      ElevationSection,
      IconsSection,
      LayoutSection,
      LayoutPrimitivesSection,
      MotionSection,
      OpacitySection,
      RadiusSection,
      ScrollbarSection,
      SpacingSection,
      SurfaceLevelsSection,
      ThemingSection,
      TypographySection,
      ZIndexSection,
    ],
  },
  {
    path: 'patterns',
    title: 'Patterns',
    sections: [
      PageCompositionSection,
      ActivitySection,
      EmptyStateSection,
      PatternsFilterBarSection,
      FormLayoutSection,
      PatternsPageHeaderSection,
    ],
  },
  {
    path: 'practice',
    title: 'Practice',
    sections: [
      RulesSection,
      ClaudeDesignSection,
      DoDontSection,
      TokenDisciplineSection,
      SignalFormsSection,
    ],
  },
  {
    path: 'reference',
    title: 'Tokens reference',
    sections: [TokensReferenceSection],
  },
  { path: 'changelog', title: 'Changelog', sections: [ChangelogSection] },
];
