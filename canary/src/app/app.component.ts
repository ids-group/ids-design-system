import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonComponent,
  CheckboxComponent,
  InputComponent,
  ModalComponent,
  SelectComponent,
  type ButtonColor,
  type ButtonVariant,
  type DsSize,
  type SelectOption,
} from '@ids-group-ltd/ids-design-system';
import {
  CellTemplateDirective,
  TableComponent,
  type TableColumn,
} from '@ids-group-ltd/ids-design-system/table';
import {
  LineChartComponent,
  type LineChartSeries,
} from '@ids-group-ltd/ids-design-system/line-chart';
import type { ChartTooltipContext } from '@ids-group-ltd/ids-design-system/chart-tooltip';
import { AppTooltipDirective } from './app-tooltip.directive';

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  status: 'paid' | 'due';
}

@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CheckboxComponent,
    InputComponent,
    SelectComponent,
    ModalComponent,
    TableComponent,
    CellTemplateDirective,
    LineChartComponent,
    AppTooltipDirective,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly name = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  readonly region = new FormControl('north', { nonNullable: true });
  readonly agreed = new FormControl(false, { nonNullable: true });
  readonly regions: readonly SelectOption[] = [
    { value: 'north', label: 'North' },
    { value: 'south', label: 'South' },
  ];

  readonly buttonColors: readonly ButtonColor[] = [
    'primary',
    'neutral',
    'error',
  ];
  readonly buttonVariants: readonly ButtonVariant[] = [
    'solid',
    'tonal',
    'outline',
    'ghost',
    'text',
  ];
  readonly buttonSizes: readonly DsSize[] = ['sm', 'md', 'lg'];

  readonly invoices: readonly Invoice[] = [
    { id: 'a1', customer: 'Acme', amount: 1200, status: 'paid' },
    { id: 'b2', customer: 'Globex', amount: 830, status: 'due' },
  ];
  readonly columns: readonly TableColumn<Invoice>[] = [
    { key: 'customer', label: 'Customer', sortable: true },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      cell: (row) => `${row.amount}`,
    },
    { key: 'status', label: 'Status' },
  ];
  readonly invoiceId = (row: Invoice): string => row.id;
  readonly sortKey = signal<string | null>(null);

  readonly modalOpen = signal(false);

  readonly categories: readonly string[] = ['Jan', 'Feb', 'Mar'];
  readonly series: readonly LineChartSeries[] = [
    { id: 'revenue', label: 'Revenue', data: [3, 5, 4] },
    { id: 'cost', label: 'Cost', data: [2, null, 3], area: 'fade' },
  ];

  invoiceTotal(row: Invoice): string {
    return `${row.customer}: ${row.amount.toFixed(2)}`;
  }

  tooltipTotal(context: ChartTooltipContext): number {
    return context.entries.reduce((sum, entry) => sum + entry.value, 0);
  }
}
