import { PageComponent } from './page.component';

export abstract class ListComponent extends PageComponent {
  abstract page: number;
  abstract total: number;
  abstract pageSize: number;
  abstract loading: boolean;
}
