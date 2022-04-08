import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { OptionEntity } from '../../interfaces/option.interface';
import { OptionService } from '../../pages/options/option.service';
import { BreadcrumbData } from './breadcrumb.interface';
import { BreadcrumbService } from './breadcrumb.service';

@Component({
  selector: 'i-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.less']
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbData!: BreadcrumbData;
  options: OptionEntity | null = null;

  private breadcrumbListener!: Subscription;
  private optionsListener!: Subscription;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private optionService: OptionService
  ) {
  }

  ngOnInit(): void {
    this.optionsListener = this.optionService.options$.subscribe((options) => {
      this.options = options;
    });
    this.breadcrumbListener = this.breadcrumbService.breadcrumb$.subscribe((breadcrumbData) => {
      this.breadcrumbData = { ...breadcrumbData };
      this.breadcrumbData.list.unshift({
        'label': '首页',
        'url': '/',
        'tooltip': `${this.options?.['site_name']}后台首页`
      });
    });
  }

  ngOnDestroy() {
    this.breadcrumbListener.unsubscribe();
    this.optionsListener.unsubscribe();
  }
}
