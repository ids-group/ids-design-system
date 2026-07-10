import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  ButtonComponent,
  PageHeaderComponent,
  SidenavComponent,
  SidenavItemComponent,
  StatComponent,
  StatusDotComponent,
  TabComponent,
  TabsComponent,
} from 'ds';

interface SemanticSwatch {
  readonly name: string;
  readonly token: string;
  readonly inverted?: boolean;
}

interface SemanticGroup {
  readonly label: string;
  readonly swatches: readonly SemanticSwatch[];
}

interface RampSpec {
  readonly label: string;
  readonly desc: string;
  readonly prefix: string;
  readonly stops: readonly number[];
}

@Component({
  selector: 'section-foundations-color',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [
    DocsSectionComponent,
    ButtonComponent,
    PageHeaderComponent,
    SidenavComponent,
    SidenavItemComponent,
    StatComponent,
    StatusDotComponent,
    TabComponent,
    TabsComponent,
  ],
  templateUrl: './color.section.html',
  styleUrl: './color.section.scss',
})
export class ColorSection {
  protected readonly groups: readonly SemanticGroup[] = [
    {
      label: 'Primary',
      swatches: [
        { name: 'primary', token: '--primary' },
        { name: 'primary-hover', token: '--primary-hover' },
        { name: 'primary-pressed', token: '--primary-pressed' },
        { name: 'primary-subtitle', token: '--primary-subtitle' },
        { name: 'primary-muted', token: '--primary-muted' },
      ],
    },
    {
      label: 'Error',
      swatches: [
        { name: 'error', token: '--error' },
        { name: 'error-hover', token: '--error-hover' },
        { name: 'error-subtitle', token: '--error-subtitle' },
        { name: 'error-muted', token: '--error-muted' },
        { name: 'error-border', token: '--error-border' },
      ],
    },
    {
      label: 'Success',
      swatches: [
        { name: 'success', token: '--success' },
        { name: 'success-hover', token: '--success-hover' },
        { name: 'success-subtitle', token: '--success-subtitle' },
        { name: 'success-muted', token: '--success-muted' },
        { name: 'success-border', token: '--success-border' },
      ],
    },
    {
      label: 'Warning',
      swatches: [
        { name: 'warning', token: '--warning' },
        { name: 'warning-hover', token: '--warning-hover' },
        { name: 'warning-subtitle', token: '--warning-subtitle' },
        { name: 'warning-muted', token: '--warning-muted' },
        { name: 'warning-border', token: '--warning-border' },
      ],
    },
    {
      label: 'Info',
      swatches: [
        { name: 'info', token: '--info' },
        { name: 'info-hover', token: '--info-hover' },
        { name: 'info-subtitle', token: '--info-subtitle' },
        { name: 'info-muted', token: '--info-muted' },
        { name: 'info-border', token: '--info-border' },
      ],
    },
    {
      label: 'Neutral · text',
      swatches: [
        { name: 'primary', token: '--text-primary' },
        { name: 'secondary', token: '--text-secondary' },
        { name: 'tertiary', token: '--text-tertiary' },
        { name: 'muted', token: '--text-muted' },
        { name: 'link', token: '--text-link' },
      ],
    },
    {
      label: 'Neutral · border',
      swatches: [
        { name: 'default', token: '--border-default' },
        { name: 'strong', token: '--border-strong' },
        { name: 'subtitle', token: '--border-subtitle' },
        { name: 'divider', token: '--border-divider' },
      ],
    },
    {
      label: 'Surface',
      swatches: [
        { name: 'canvas', token: '--surface-canvas' },
        { name: 'default', token: '--surface-default' },
        { name: 'secondary', token: '--surface-secondary' },
        { name: 'tint', token: '--surface-tint' },
        { name: 'inverted', token: '--surface-inverted', inverted: true },
      ],
    },
  ];

  protected readonly ramps: readonly RampSpec[] = [
    {
      label: 'Blue',
      desc: 'The default theme maps --primary onto this ramp. Stop 600 is the canonical action.',
      prefix: 'blue',
      stops: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
    {
      label: 'Neutral',
      desc: 'Backgrounds, borders, text, dividers. 13 stops cover tables, hover lanes and dark headers.',
      prefix: 'neutral',
      stops: [0, 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    },
    {
      label: 'Red',
      desc: 'The default theme maps --error onto this ramp. Validation failures, destructive confirmations, conflict.',
      prefix: 'red',
      stops: [50, 100, 200, 300, 400, 500, 600, 700],
    },
    {
      label: 'Success · Green',
      desc: 'Confirmations, completed actions, healthy state.',
      prefix: 'green',
      stops: [50, 100, 200, 300, 400, 500, 600, 700],
    },
    {
      label: 'Warning · Yellow',
      desc: 'Warnings, soft conflicts, pending state.',
      prefix: 'yellow',
      stops: [50, 100, 200, 300, 400, 500, 600, 700],
    },
    {
      label: 'Sky',
      desc: 'The default theme maps --info onto this ramp. A brighter blue, kept distinct from the primary --blue ramp so info is never confused with primary action.',
      prefix: 'sky',
      stops: [50, 100, 200, 300, 400, 500, 600, 700],
    },
  ];
}
