import { Title } from '@angular/platform-browser';
import { BreadcrumbEntity } from '../components/breadcrumb/breadcrumb.interface';

export abstract class BaseComponent {
  protected abstract titles: string[];
  protected abstract title: Title;

  abstract showBreadcrumb: boolean;
  protected abstract breadcrumbs: BreadcrumbEntity[];

  protected abstract updateBreadcrumb(): void;

  protected titleSeparator = ' - ';

  protected updateTitle(titles?: string[]): void {
    this.title.setTitle((titles || this.titles).join(this.titleSeparator));
  }
}
