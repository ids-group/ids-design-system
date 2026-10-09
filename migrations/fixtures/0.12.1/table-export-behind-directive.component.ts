import { Component } from '@angular/core';
import { TableColumn, TableComponent } from '@ids-group-ltd/ids-design-system';

interface Product {
  name: string;
}

@Component({
  selector: 'app-products-export',
  imports: [TableComponent],
  template: `
    <!-- expect: after NG8002 -->
    <ds-table [data]="rows" [columns]="columns" [exportFilename]="'products.csv'" />
  `,
})
export class AppProductsExport {
  readonly rows: Product[] = [];
  readonly columns: TableColumn<Product>[] = [];
}
