import { DonutChartComponent, LineChartComponent } from '@ids-group-ltd/ids-design-system';

// @ts-expect-error after TS2415
export class AppLineChart extends LineChartComponent {
  // @ts-expect-error before TS4113
  override readingAnchor(screen: DOMMatrix, category: number): never {
    throw new Error();
  }
}

export class AppDonutChart extends DonutChartComponent {
  stagger(): string {
    // @ts-expect-error after TS2339
    return this.markStagger(0);
  }
}
