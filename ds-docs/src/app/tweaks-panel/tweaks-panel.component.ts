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
  protected readonly primaryH = signal(218);
  protected readonly primaryS = signal(88);
  protected readonly primaryL = signal(48);
  protected readonly secondaryH = signal(218);
  protected readonly secondaryS = signal(88);
  protected readonly secondaryL = signal(48);
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
  protected setPrimaryH(value: string): void {
    const v = Number(value);
    this.primaryH.set(v);
    document.documentElement.style.setProperty('--primary-h', `${v}`);
  }
  protected setPrimaryS(value: string): void {
    const v = Number(value);
    this.primaryS.set(v);
    document.documentElement.style.setProperty('--primary-s', `${v}%`);
  }
  protected setPrimaryL(value: string): void {
    const v = Number(value);
    this.primaryL.set(v);
    document.documentElement.style.setProperty('--primary-l', `${v}%`);
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
    ['--primary-h', '--primary-s', '--primary-l', '--secondary-h', '--secondary-s', '--secondary-l', 'font-size'].forEach((p) =>
      document.documentElement.style.removeProperty(p),
    );
    document.documentElement.removeAttribute('data-density');
    this.setBrand('default');
    this.setNeutrals('cool-gray');
    this.density.set('cozy');
    this.primaryH.set(218);
    this.primaryS.set(88);
    this.primaryL.set(48);
    this.secondaryH.set(218);
    this.secondaryS.set(88);
    this.secondaryL.set(48);
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
