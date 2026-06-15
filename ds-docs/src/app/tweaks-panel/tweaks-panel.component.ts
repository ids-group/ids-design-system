import { Component, ViewEncapsulation, signal } from '@angular/core';

type BrandPreview = 'default' | 'manage-my';

const BRAND_STORAGE_KEY = 'ds-docs-brand-preview';

@Component({
  selector: 'tweaks-panel',
  standalone: true,
  templateUrl: './tweaks-panel.component.html',
  styleUrl: './tweaks-panel.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class TweaksPanelComponent {
  protected readonly open = signal(false);
  protected readonly density = signal<'compact' | 'cozy' | 'comfy'>('cozy');
  protected readonly brand = signal<BrandPreview>('default');
  protected readonly neutrals = signal<'cool-gray' | 'brand'>('cool-gray');
  // Defaults mirror the live system: the blue ramp is hsl(229, 100%, 59%)
  // (themes/default/_palette.scss), and --secondary defaults off the same channels.
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
  }

  protected toggle(): void { this.open.update((v) => !v); }
  protected setDensity(d: 'compact' | 'cozy' | 'comfy'): void {
    this.density.set(d);
    document.documentElement.setAttribute('data-density', d);
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
  // --primary-subtle/strong all resolve from --blue-*, and --primary-h follows
  // --blue-h, so fills and focus rings re-tint together. Setting --primary-*
  // directly would NOT move --primary (it maps to --blue-600).
  protected setPrimaryH(value: string): void {
    const v = Number(value);
    this.primaryH.set(v);
    document.documentElement.style.setProperty('--blue-h', `${v}`);
  }
  protected setPrimaryS(value: string): void {
    const v = Number(value);
    this.primaryS.set(v);
    document.documentElement.style.setProperty('--blue-s', `${v}%`);
  }
  protected setPrimaryL(value: string): void {
    const v = Number(value);
    this.primaryL.set(v);
    document.documentElement.style.setProperty('--blue-l', `${v}%`);
  }
  protected setSecondaryH(value: string): void {
    const v = Number(value);
    this.secondaryH.set(v);
    document.documentElement.style.setProperty('--secondary-h', `${v}`);
  }
  protected setSecondaryS(value: string): void {
    const v = Number(value);
    this.secondaryS.set(v);
    document.documentElement.style.setProperty('--secondary-s', `${v}%`);
  }
  protected setSecondaryL(value: string): void {
    const v = Number(value);
    this.secondaryL.set(v);
    document.documentElement.style.setProperty('--secondary-l', `${v}%`);
  }
  protected setFs(value: string): void {
    const v = Number(value);
    this.rootFs.set(v);
    document.documentElement.style.setProperty('font-size', `${v}px`);
  }
  protected reset(): void {
    ['--blue-h', '--blue-s', '--blue-l', '--secondary-h', '--secondary-s', '--secondary-l', 'font-size'].forEach((p) =>
      document.documentElement.style.removeProperty(p),
    );
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
}
