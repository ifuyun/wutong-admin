import { BaseComponent } from './base.component';

export abstract class ListComponent extends BaseComponent {
  abstract page: number;
  abstract total: number;
  abstract pageSize: number;
  abstract loading: boolean;
}
