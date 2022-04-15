import { Title } from '@angular/platform-browser';
import { BreadcrumbData } from '../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../components/breadcrumb/breadcrumb.service';
import { BaseComponent } from './base.component';

export abstract class PageComponent extends BaseComponent {
  protected abstract titles: string[];
  protected abstract title: Title;

  protected abstract breadcrumbData: BreadcrumbData;
  protected abstract breadcrumbService: BreadcrumbService;

  protected abstract updateBreadcrumb(breadcrumbData?: BreadcrumbData): void;

  protected titleSeparator = ' - ';

  protected updateTitle(titles?: string[]): void {
    this.title.setTitle((titles || this.titles).join(this.titleSeparator));
  }
}
