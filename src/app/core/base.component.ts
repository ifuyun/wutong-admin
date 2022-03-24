import { FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { BreadcrumbData } from '../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../components/breadcrumb/breadcrumb.service';

export abstract class BaseComponent {
  protected abstract titles: string[];
  protected abstract title: Title;

  protected abstract breadcrumbData: BreadcrumbData;
  protected abstract breadcrumbService: BreadcrumbService;

  protected abstract updateBreadcrumb(breadcrumbData?: BreadcrumbData): void;

  protected titleSeparator = ' - ';

  protected updateTitle(titles?: string[]): void {
    this.title.setTitle((titles || this.titles).join(this.titleSeparator));
  }

  protected resetFormStatus(form: FormGroup): void {
    form.markAsPristine();
    form.markAsUntouched();
    form.updateValueAndValidity();
  }

  protected validateForm(form: FormGroup): { value: any, rawValue: any, valid: boolean } {
    Object.keys(form.controls).forEach((key) => {
      form.controls[key].markAsDirty();
      form.controls[key].updateValueAndValidity();
    });
    return {
      value: form.value,
      rawValue: form.getRawValue(),
      valid: form.valid
    };
  }
}
