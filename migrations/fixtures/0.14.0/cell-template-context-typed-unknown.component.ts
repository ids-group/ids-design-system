import { Component } from '@angular/core';
import {
  CellTemplateDirective,
  TableColumn,
  TableComponent,
} from '@ids-group-ltd/ids-design-system';

interface Product {
  name: string;
}

@Component({
  selector: 'app-products',
  imports: [TableComponent, CellTemplateDirective],
  template: `
    <ds-table [data]="rows" [columns]="columns">
      <ng-template dsCellTemplate="name" let-row>
        <!-- expect: after TS2571 -->
        {{ row.name }}
        <!-- expect: after TS2345 -->
        {{ label(row) }}
      </ng-template>
      <ng-template dsCellTemplate="name" [dsCellTemplateOf]="rows" let-row>
        {{ row.name }} {{ label(row) }}
      </ng-template>
    </ds-table>
  `,
})
export class AppProducts {
  readonly rows: Product[] = [];
  readonly columns: TableColumn<Product>[] = [];
  label(product: Product): string {
    return product.name;
  }
}
