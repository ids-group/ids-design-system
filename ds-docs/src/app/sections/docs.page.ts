import { Component, ViewEncapsulation } from '@angular/core';

import { HomeSection } from './home/home.section';

import { ColorSection } from './foundations/color/color.section';
import { TypographySection } from './foundations/typography/typography.section';
import { SpacingSection } from './foundations/spacing/spacing.section';
import { RadiusSection } from './foundations/radius/radius.section';
import { ElevationSection } from './foundations/elevation/elevation.section';
import { MotionSection } from './foundations/motion/motion.section';
import { DensitySection } from './foundations/density/density.section';
import { IconsSection } from './foundations/icons/icons.section';
import { LayoutSection } from './foundations/layout/layout.section';
import { ScrollbarSection } from './foundations/scrollbar/scrollbar.section';
import { BordersSection } from './foundations/borders/borders.section';
import { OpacitySection } from './foundations/opacity/opacity.section';
import { SurfaceLevelsSection } from './foundations/surface-levels/surface-levels.section';
import { ThemingSection } from './foundations/theming/theming.section';
import { ZIndexSection } from './foundations/z-index/z-index.section';
import { BrowserTabSection } from './foundations/browser-tab/browser-tab.section';
import { ChartsSection } from './foundations/charts/charts.section';

import { IconSection } from './components/icon/icon.section';
import { ButtonSection } from './components/button/button.section';
import { IconButtonSection } from './components/icon-button/icon-button.section';
import { BadgeSection } from './components/badge/badge.section';
import { StatusDotSection } from './components/status-dot/status-dot.section';
import { AvatarSection } from './components/avatar/avatar.section';
import { CardSection } from './components/card/card.section';
import { StatSection } from './components/stat/stat.section';
import { TabsSection } from './components/tabs/tabs.section';
import { InputSection } from './components/input/input.section';
import { TextareaSection } from './components/textarea/textarea.section';
import { NumberStepperSection } from './components/number-stepper/number-stepper.section';
import { SearchSection } from './components/search/search.section';
import { SelectSection } from './components/select/select.section';
import { CheckboxSection } from './components/checkbox/checkbox.section';
import { RadioSection } from './components/radio/radio.section';
import { SwitchSection } from './components/switch/switch.section';
import { TableSection } from './components/table/table.section';
import { PaginationSection } from './components/pagination/pagination.section';
import { DatePickerSection } from './components/date-picker/date-picker.section';
import { BreadcrumbsSection } from './components/breadcrumbs/breadcrumbs.section';
import { SidenavSection } from './components/sidenav/sidenav.section';
import { TopbarSection } from './components/topbar/topbar.section';
import { PageHeaderSection as ComponentsPageHeaderSection } from './components/page-header/page-header.section';
import { ModalSection } from './components/modal/modal.section';
import { MenuSection } from './components/menu/menu.section';
import { BannerSection } from './components/banner/banner.section';
import { DropzoneSection } from './components/dropzone/dropzone.section';
import { EmptyStateComponentSection } from './components/empty-state/empty-state.section';
import { ProgressSection } from './components/progress/progress.section';
import { SpinnerSection } from './components/spinner/spinner.section';
import { SkeletonSection } from './components/skeleton/skeleton.section';
import { AccordionSection } from './components/accordion/accordion.section';
import { AlertSection } from './components/alert/alert.section';
import { StepperSection } from './components/stepper/stepper.section';
import { TooltipSection } from './components/tooltip/tooltip.section';
import { PopoverSection } from './components/popover/popover.section';
import { ToastSection } from './components/toast/toast.section';
import { DrawerSection } from './components/drawer/drawer.section';
import { BottomSheetSection } from './components/bottom-sheet/bottom-sheet.section';
import { TagSection } from './components/tag/tag.section';
import { W3wSection } from './components/w3w/w3w.section';
import { LinkSection } from './components/link/link.section';
import { PageFooterSection } from './components/page-footer/page-footer.section';
import { AutocompleteSection } from './components/autocomplete/autocomplete.section';

import { DescriptionListSection } from './components/description-list/description-list.section';
import { LayoutPrimitivesSection } from './components/layout-primitives/layout-primitives.section';
import { SegmentedSection } from './components/segmented/segmented.section';
import { ListSection } from './components/list/list.section';
import { SplitButtonSection } from './components/split-button/split-button.section';
import { TimePickerSection } from './components/time-picker/time-picker.section';
import { TimelineSection } from './components/timeline/timeline.section';
import { OtpInputSection } from './components/otp-input/otp-input.section';
import { SliderSection } from './components/slider/slider.section';
import { LoadingOverlaySection } from './components/loading-overlay/loading-overlay.section';
import { TreeSection } from './components/tree/tree.section';
import { ColorPickerSection } from './components/color-picker/color-picker.section';
import { MultiSelectSection } from './components/multi-select/multi-select.section';

import { PageHeaderSection as PatternsPageHeaderSection } from './patterns/page-header/page-header.section';
import { FilterBarSection } from './patterns/filter-bar/filter-bar.section';
import { FormLayoutSection } from './patterns/form-layout/form-layout.section';
import { ActivitySection } from './patterns/activity/activity.section';
import { EmptyStateSection } from './patterns/empty-state/empty-state.section';

import { TokenDisciplineSection } from './practice/token-discipline/token-discipline.section';
import { DoDontSection } from './practice/do-dont/do-dont.section';

import { TokensReferenceSection } from './tokens-reference/tokens-reference.section';
import { ChangelogSection } from './changelog/changelog.section';

@Component({
  selector: 'page-docs',
  standalone: true,
  imports: [
    HomeSection,
    ColorSection,
    TypographySection,
    SpacingSection,
    RadiusSection,
    ElevationSection,
    MotionSection,
    DensitySection,
    IconsSection,
    LayoutSection,
    ScrollbarSection,
    BordersSection,
    OpacitySection,
    SurfaceLevelsSection,
    ThemingSection,
    ZIndexSection,
    BrowserTabSection,
    ChartsSection,
    IconSection,
    ButtonSection,
    IconButtonSection,
    BadgeSection,
    StatusDotSection,
    AvatarSection,
    CardSection,
    StatSection,
    TabsSection,
    InputSection,
    TextareaSection,
    NumberStepperSection,
    CheckboxSection,
    RadioSection,
    SearchSection,
    SelectSection,
    SwitchSection,
    TableSection,
    PaginationSection,
    DatePickerSection,
    BreadcrumbsSection,
    SidenavSection,
    TopbarSection,
    ComponentsPageHeaderSection,
    ModalSection,
    MenuSection,
    BannerSection,
    DropzoneSection,
    EmptyStateComponentSection,
    ProgressSection,
    SpinnerSection,
    SkeletonSection,
    AccordionSection,
    AlertSection,
    StepperSection,
    TooltipSection,
    PopoverSection,
    ToastSection,
    DrawerSection,
    BottomSheetSection,
    TagSection,
    W3wSection,
    LinkSection,
    PageFooterSection,
    AutocompleteSection,
    DescriptionListSection,
    LayoutPrimitivesSection,
    SegmentedSection,
    ListSection,
    SplitButtonSection,
    TimePickerSection,
    TimelineSection,
    OtpInputSection,
    SliderSection,
    LoadingOverlaySection,
    TreeSection,
    ColorPickerSection,
    MultiSelectSection,
    PatternsPageHeaderSection,
    FilterBarSection,
    FormLayoutSection,
    ActivitySection,
    EmptyStateSection,
    TokenDisciplineSection,
    DoDontSection,
    TokensReferenceSection,
    ChangelogSection,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section-home />

    <h1 class="group-title t-h2">Actions</h1>

    <section-components-button />

    <section-components-segmented />

    <section-components-icon-button />

    <section-components-split-button />

    <section-components-link />

    <h1 class="group-title t-h2">Forms &amp; inputs</h1>

    <section-components-autocomplete />

    <section-components-checkbox />

    <section-components-color-picker />

    <section-components-date-picker />

    <section-components-dropzone />

    <section-components-input />

    <section-components-multi-select />

    <section-components-number-stepper />

    <section-components-otp-input />

    <section-components-radio />

    <section-components-search />

    <section-components-select />

    <section-components-slider />

    <section-components-switch />

    <section-components-textarea />

    <section-components-time-picker />

    <section-components-w3w />

    <h1 class="group-title t-h2">Navigation</h1>

    <section-components-breadcrumbs />

    <section-components-menu />

    <section-components-pagination />

    <section-components-sidenav />

    <section-components-stepper />

    <section-components-tabs />

    <section-components-topbar />

    <h1 class="group-title t-h2">Data display</h1>

    <section-components-accordion />

    <section-components-avatar />

    <section-components-card />

    <section-components-description-list />

    <section-components-icon />

    <section-components-list />

    <section-components-stat />

    <section-components-table />

    <section-components-tag />

    <section-components-timeline />

    <section-components-tree />

    <h1 class="group-title t-h2">Feedback &amp; status</h1>

    <section-components-alert />

    <section-components-badge />

    <section-components-banner />

    <section-components-empty-state />

    <section-components-loading-overlay />

    <section-components-progress />

    <section-components-skeleton />

    <section-components-spinner />

    <section-components-status-dot />

    <section-components-toast />

    <h1 class="group-title t-h2">Overlays</h1>

    <section-components-bottom-sheet />

    <section-components-drawer />

    <section-components-modal />

    <section-components-popover />

    <section-components-tooltip />

    <h1 class="group-title t-h2">Page structure</h1>

    <section-components-page-footer />

    <section-components-page-header />

    <h1 class="group-title t-h2">Foundations</h1>

    <section-foundations-borders />

    <section-foundations-browser-tab />

    <section-foundations-charts />

    <section-foundations-color />

    <section-foundations-density />

    <section-foundations-elevation />

    <section-foundations-icons />

    <section-foundations-layout />

    <section-components-layout-primitives />

    <section-foundations-motion />

    <section-foundations-opacity />

    <section-foundations-radius />

    <section-foundations-scrollbar />

    <section-foundations-spacing />

    <section-foundations-surface-levels />

    <section-foundations-theming />

    <section-foundations-typography />

    <section-foundations-z-index />

    <h1 class="group-title t-h2">Patterns</h1>

    <pattern-activity />

    <pattern-empty-state />

    <pattern-filter-bar />

    <pattern-form-layout />

    <pattern-page-header />

    <h1 class="group-title t-h2">Practice</h1>

    <practice-do-dont />

    <practice-token-discipline />

    <h1 class="group-title t-h2">Tokens reference</h1>

    <section-tokens-reference />

    <h1 class="group-title t-h2">Changelog</h1>

    <section-changelog />
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: var(--col-cap-content);
        margin-inline: auto;
        padding: var(--space-12) var(--space-16) var(--space-24);
      }
      @media (max-width: 1100px) {
        :host {
          padding: var(--space-10) var(--space-8) var(--space-16);
        }
      }
      @media (max-width: 900px) {
        :host {
          padding: var(--space-8) var(--space-6) var(--space-12);
        }
      }
      .group-title {
        margin-top: var(--space-16);
        padding-bottom: var(--space-3);
        border-bottom: var(--border-width-default) solid var(--border-divider);
      }
      section-home,
      section-foundations-color,
      section-foundations-typography,
      section-foundations-spacing,
      section-foundations-radius,
      section-foundations-elevation,
      section-foundations-motion,
      section-foundations-density,
      section-foundations-icons,
      section-foundations-layout,
      section-foundations-scrollbar,
      section-foundations-borders,
      section-foundations-opacity,
      section-foundations-surface-levels,
      section-foundations-theming,
      section-foundations-z-index,
      section-foundations-browser-tab,
      section-foundations-charts,
      section-components-icon,
      section-components-button,
      section-components-icon-button,
      section-components-badge,
      section-components-status-dot,
      section-components-avatar,
      section-components-card,
      section-components-stat,
      section-components-tabs,
      section-components-input,
      section-components-textarea,
      section-components-number-stepper,
      section-components-checkbox,
      section-components-radio,
      section-components-search,
      section-components-select,
      section-components-switch,
      section-components-table,
      section-components-pagination,
      section-components-date-picker,
      section-components-breadcrumbs,
      section-components-sidenav,
      section-components-topbar,
      section-components-page-header,
      section-components-modal,
      section-components-menu,
      section-components-banner,
      section-components-dropzone,
      section-components-empty-state,
      section-components-progress,
      section-components-spinner,
      section-components-skeleton,
      section-components-accordion,
      section-components-alert,
      section-components-stepper,
      section-components-tooltip,
      section-components-popover,
      section-components-toast,
      section-components-drawer,
      section-components-bottom-sheet,
      section-components-tag,
      section-components-w3w,
      section-components-link,
      section-components-page-footer,
      section-components-autocomplete,
      section-components-description-list,
      section-components-layout-primitives,
      section-components-segmented,
      section-components-list,
      section-components-split-button,
      section-components-time-picker,
      section-components-timeline,
      section-components-otp-input,
      section-components-slider,
      section-components-loading-overlay,
      section-components-tree,
      section-components-color-picker,
      section-components-multi-select,
      pattern-page-header,
      pattern-filter-bar,
      pattern-form-layout,
      pattern-activity,
      pattern-empty-state,
      practice-token-discipline,
      practice-do-dont,
      section-tokens-reference,
      section-changelog {
        display: block;
        margin-top: var(--space-12);
      }
      section-home {
        margin-top: 0;
      }
    `,
  ],
})
export class DocsPage {}
