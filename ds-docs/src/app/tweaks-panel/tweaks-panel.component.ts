import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ButtonComponent, DrawerComponent, SegmentedComponent, SliderComponent } from 'ds';

type BrandPreview = 'default' | 'manage-my';

const BRAND_STORAGE_KEY = 'ds-docs-brand-preview';
const THEME_STORAGE_KEY = 'ds-docs-theme';

@Component({
  selector: 'tweaks-panel',
  standalone: true,
  imports: [ButtonComponent, DrawerComponent, SegmentedComponent, SliderComponent],
  templateUrl: './tweaks-panel.component.html',
  styleUrls: ['./tweaks-panel.component.scss', './tweaks-panel.component.responsive.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TweaksPanelComponent {
  protected readonly open = signal(false);

  openPanel(): void {
    this.open.set(true);
  }

  // Option lists for the ds-segmented controls below.
  protected readonly themeOptions = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];
  protected readonly densityOptions = [
    { label: 'Ultra', value: 'ultra-compact' },
    { label: 'Compact', value: 'compact' },
    { label: 'Cozy', value: 'cozy' },
    { label: 'Comfy', value: 'comfy' },
  ];
  protected readonly brandOptions = [
    { label: 'Default', value: 'default' },
    { label: 'ManageMy', value: 'manage-my' },
  ];
  protected readonly neutralsOptions = [
    { label: 'Cool gray', value: 'cool-gray' },
    { label: 'From brand', value: 'brand' },
  ];
  protected readonly density = signal<'ultra-compact' | 'compact' | 'cozy' | 'comfy'>('cozy');
  protected readonly brand = signal<BrandPreview>('default');
  protected readonly theme = signal<'light' | 'dark'>('light');
  protected readonly neutrals = signal<'cool-gray' | 'brand'>('cool-gray');
  // Defaults mirror the live system: the blue ramp is hsl(229, 100%, 59%)
  // (themes/light/_palette.scss), and --secondary defaults off the same channels.
  protected readonly primaryH = signal(229);
  protected readonly primaryS = signal(100);
  protected readonly primaryL = signal(59);
  protected readonly secondaryH = signal(229);
  protected readonly secondaryS = signal(100);
  protected readonly secondaryL = signal(59);
  protected readonly rootFs = signal(16);

  constructor() {
    // Restore brand preview from localStorage on init so the choice survives
    // navigation/refresh while previewing brand-tinted demos.
    const stored = this.readStoredBrand();
    if (stored) {
      this.applyBrand(stored);
    }
    const storedTheme = this.readStoredTheme();
    if (storedTheme) {
      this.setTheme(storedTheme);
    }
  }

  protected setDensity(d: 'ultra-compact' | 'compact' | 'cozy' | 'comfy'): void {
    this.density.set(d);
    document.documentElement.setAttribute('data-density', d);
  }
  protected setTheme(t: 'light' | 'dark'): void {
    this.theme.set(t);
    // Light is the default (no attribute needed); only dark sets/persists the attribute.
    if (t === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      if (t === 'dark') {
        localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      } else {
        localStorage.removeItem(THEME_STORAGE_KEY);
      }
    } catch {
      // SSR / privacy-mode — signal state still applies.
    }
  }
  protected setNeutrals(family: 'cool-gray' | 'brand'): void {
    this.neutrals.set(family);
    if (family === 'brand') {
      document.documentElement.setAttribute('data-neutrals', 'brand');
    } else {
      document.documentElement.removeAttribute('data-neutrals');
    }
  }
  protected setBrand(b: BrandPreview): void {
    this.applyBrand(b);
    try {
      if (b === 'default') {
        localStorage.removeItem(BRAND_STORAGE_KEY);
      } else {
        localStorage.setItem(BRAND_STORAGE_KEY, b);
      }
    } catch {
      // SSR / privacy-mode — silently ignore; signal state still applies.
    }
  }
  // Primary re-skin drives the blue ramp (the DS source of truth): --primary,
  // --primary-subtitle/strong all resolve from --blue-*, and --primary-h follows
  // --blue-h, so fills and focus rings re-tint together. Setting --primary-*
  // directly would NOT move --primary (it maps to --blue-600).
  protected setPrimaryH(value: string): void {
    const value_ = Number(value);
    this.primaryH.set(value_);
    document.documentElement.style.setProperty('--blue-h', `${value_}`);
  }
  protected setPrimaryS(value: string): void {
    const value_ = Number(value);
    this.primaryS.set(value_);
    document.documentElement.style.setProperty('--blue-s', `${value_}%`);
  }
  protected setPrimaryL(value: string): void {
    const value_ = Number(value);
    this.primaryL.set(value_);
    document.documentElement.style.setProperty('--blue-l', `${value_}%`);
  }
  protected setSecondaryH(value: string): void {
    const value_ = Number(value);
    this.secondaryH.set(value_);
    document.documentElement.style.setProperty('--secondary-h', `${value_}`);
  }
  protected setSecondaryS(value: string): void {
    const value_ = Number(value);
    this.secondaryS.set(value_);
    document.documentElement.style.setProperty('--secondary-s', `${value_}%`);
  }
  protected setSecondaryL(value: string): void {
    const value_ = Number(value);
    this.secondaryL.set(value_);
    document.documentElement.style.setProperty('--secondary-l', `${value_}%`);
  }
  protected setFs(value: string): void {
    const value_ = Number(value);
    this.rootFs.set(value_);
    document.documentElement.style.setProperty('font-size', `${value_}px`);
  }
  protected reset(): void {
    this.setTheme('light');
    [
      '--blue-h',
      '--blue-s',
      '--blue-l',
      '--secondary-h',
      '--secondary-s',
      '--secondary-l',
      'font-size',
    ].forEach((prop) => document.documentElement.style.removeProperty(prop));
    document.documentElement.removeAttribute('data-density');
    this.setBrand('default');
    this.setNeutrals('cool-gray');
    this.density.set('cozy');
    this.primaryH.set(229);
    this.primaryS.set(100);
    this.primaryL.set(59);
    this.secondaryH.set(229);
    this.secondaryS.set(100);
    this.secondaryL.set(59);
    this.rootFs.set(16);
  }

  private applyBrand(b: BrandPreview): void {
    this.brand.set(b);
    if (b === 'default') {
      document.documentElement.removeAttribute('data-brand');
    } else {
      document.documentElement.setAttribute('data-brand', b);
    }
  }

  private readStoredBrand(): BrandPreview | null {
    try {
      const raw = localStorage.getItem(BRAND_STORAGE_KEY);

      return raw === 'manage-my' ? 'manage-my' : null;
    } catch {
      return null;
    }
  }

  private readStoredTheme(): 'dark' | null {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : null;
    } catch {
      return null;
    }
  }
}
