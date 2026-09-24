import { Component, ViewEncapsulation, signal } from '@angular/core';
import { AutocompleteComponent } from 'ds/autocomplete';
import type {
  AutocompleteItem,
  AutocompleteOption,
  AutocompleteOptionGroup,
} from 'ds/autocomplete';
import { ButtonComponent } from 'ds/button';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsNonmodalNoteComponent } from '../../../shared/docs-nonmodal-note.component';

interface DemoOwner {
  id: string;
  name: string;
}

const OWNER_SEED: readonly DemoOwner[] = [
  { id: '1', name: 'Ada Lovelace' },
  { id: '2', name: 'Grace Hopper' },
  { id: '3', name: 'Barbara Liskov' },
];

/** New objects every call, which is what a refetch hands back. */
function buildOwners(): AutocompleteItem<DemoOwner>[] {
  return OWNER_SEED.map((owner) => ({
    value: { ...owner },
    label: owner.name,
  }));
}

const MEMBERS: readonly AutocompleteOption<string>[] = [
  { value: 'birchfield', label: 'Birchfield Events Ltd' },
  { value: 'harbourline', label: 'Harbourline Festivals' },
  { value: 'copperleaf', label: 'Copperleaf Concerts' },
];

const PRODUCTS: readonly AutocompleteOption<string>[] = [
  { value: 'beer', label: 'Beer kegs' },
  { value: 'cider', label: 'Cider' },
  { value: 'spirits', label: 'Spirits' },
  { value: 'wine', label: 'Wine' },
  { value: 'mixers', label: 'Mixers' },
];

const CHANNELS: readonly AutocompleteOption<string>[] = [
  { value: 'partner', label: 'Partner portal', icon: 'users' },
  {
    value: 'api',
    label: 'Partner API — not enabled',
    icon: 'link',
    disabled: true,
  },
  { value: 'direct', label: 'Direct — web', icon: 'globe' },
  { value: 'phone', label: 'Telephone', icon: 'phone' },
  { value: 'post', label: 'Post', icon: 'mail' },
];

const VENUE_GROUPS: AutocompleteOptionGroup<string>[] = [
  {
    label: 'Arenas',
    options: [
      { value: 'northgate', label: 'Northgate Arena' },
      { value: 'riverside', label: 'Riverside Arena' },
      { value: 'harbour', label: 'Harbour Hall' },
    ],
  },
  {
    label: 'Festivals',
    options: [
      { value: 'meadowlark', label: 'Meadowlark Festival' },
      { value: 'summerfields', label: 'Summer Fields Festival' },
      { value: 'lakeside', label: 'Lakeside Weekender' },
    ],
  },
  {
    label: 'Clubs',
    options: [
      { value: 'cellar', label: 'Cellar Nine' },
      { value: 'foundry', label: 'The Foundry Rooms' },
    ],
  },
];

@Component({
  selector: 'section-components-autocomplete',
  standalone: true,
  imports: [
    AutocompleteComponent,
    ButtonComponent,
    DocsSectionComponent,
    DocsNonmodalNoteComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './autocomplete.section.html',
  styleUrl: './autocomplete.section.scss',
})
export class AutocompleteSection {
  protected readonly owner = signal<DemoOwner | null>(null);
  protected readonly searchCity = signal<string | null>(null);

  protected readonly ownerOptions =
    signal<AutocompleteItem<DemoOwner>[]>(buildOwners());

  protected readonly sameOwner = (
    first: DemoOwner | null,
    second: DemoOwner | null,
  ): boolean => first?.id === second?.id;

  protected refetchOwners(): void {
    this.ownerOptions.set(buildOwners());
  }

  protected readonly members = MEMBERS;
  protected readonly products = PRODUCTS;
  protected readonly channels = CHANNELS;
  protected readonly venueGroups = VENUE_GROUPS;
  protected readonly channelValue = signal<string | null>('partner');
  protected readonly memberValue = signal<string | null>('birchfield');
  protected readonly productsValue = signal<readonly string[]>([
    'beer',
    'cider',
    'spirits',
  ]);
  protected readonly cappedProductsValue = signal<readonly string[]>([
    'beer',
    'cider',
    'spirits',
    'wine',
  ]);
  protected readonly fitProductsValue = signal<readonly string[]>([
    'beer',
    'cider',
    'spirits',
    'wine',
  ]);
  protected readonly venueValue = signal<string | null>(null);
  protected readonly toolbarProductsValue = signal<readonly string[]>(['beer']);
  protected readonly toolbarVenueValue = signal<string | null>(null);
  protected readonly tagOptions = signal<readonly AutocompleteOption<string>[]>(
    [
      { value: 'jazz', label: 'Jazz' },
      { value: 'rock', label: 'Rock' },
      { value: 'electronic', label: 'Electronic' },
    ],
  );
  protected readonly tagValue = signal<readonly string[]>([]);

  protected onCreateTag(label: string): void {
    const newOption: AutocompleteOption<string> = {
      value: label.toLowerCase().replace(/\s+/g, '-'),
      label,
    };
    this.tagOptions.update((current) => [...current, newOption]);
    this.tagValue.update((current) => [...current, newOption.value]);
  }
}
