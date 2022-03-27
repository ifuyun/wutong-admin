import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { TaxonomyStatus, TaxonomyType } from '../../../config/common.enum';
import { ListComponent } from '../../../core/list.component';
import { OptionEntity } from '../../../interfaces/option.interface';
import { OptionsService } from '../../../services/options.service';
import { TaxonomyNode, TaxonomyQueryParam } from '../taxonomy.interface';
import { TaxonomyService } from '../taxonomy.service';

@Component({
  selector: 'app-taxonomy-list',
  templateUrl: './taxonomy-list.component.html',
  styleUrls: ['./taxonomy-list.component.less']
})
export class TaxonomyListComponent extends ListComponent implements OnInit, OnDestroy {
  @Input() taxonomyType!: TaxonomyType;

  taxonomyList: TaxonomyNode[] = [];
  page: number = 1;
  total: number = 0;
  pageSize: number = 10;
  loading: boolean = false;
  keyword: string = '';
  allChecked = false;
  indeterminate = false;
  checkedMap: Record<string, boolean> = {};

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: true,
    list: []
  };

  private status!: TaxonomyStatus | null;
  private orders: string[][] = [];
  private lastParam: string = '';
  private options: OptionEntity = {};
  private titleMap = {
    [TaxonomyType.POST]: '文章分类管理',
    [TaxonomyType.TAG]: '标签管理',
    [TaxonomyType.LINK]: '链接分类管理'
  };

  private optionsListener!: Subscription;
  private paramListener!: Subscription;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionsService: OptionsService,
    private taxonomyService: TaxonomyService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {
    super();
  }

  ngOnInit(): void {
    this.optionsListener = this.optionsService.options$.subscribe((options) => {
      this.options = options;
    });
    this.titles = [this.titleMap[this.taxonomyType], '类别管理', this.options['site_name']];
    this.updateTitle();
    this.updateBreadcrumb();
    this.paramListener = this.route.queryParamMap.subscribe((queryParams) => {
      this.page = Number(queryParams.get('page')) || 1;
      this.keyword = queryParams.get('keyword')?.trim() || '';
      this.status = null;
      const status = queryParams.get('status')?.trim();
      if (status) {
        this.status = <TaxonomyStatus>(parseInt(status, 10));
      }
      this.fetchData();
    });
  }

  ngOnDestroy(): void {
    this.optionsListener.unsubscribe();
    this.paramListener.unsubscribe();
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    const { pageSize, pageIndex, sort, filter } = params;
    this.pageSize = pageSize;
    this.page = pageIndex;
    this.orders = [];
    sort.forEach((item) => {
      if (item.value) {
        this.orders.push([item.key, item.value === 'descend' ? 'desc' : 'asc']);
      }
    });
    this.fetchData();
  }

  onAllChecked(checked: boolean) {
    this.taxonomyList.forEach((item) => {
      this.checkedMap[item.taxonomyId] = checked;
    });
    this.allChecked = checked;
    this.indeterminate = false;
  }

  onItemChecked(checkedKey: string, checked: boolean) {
    this.checkedMap[checkedKey] = checked;
    this.refreshCheckedStatus();
  }

  onSearch(event?: KeyboardEvent) {
    if (event && event.key !== 'Enter') {
      return;
    }
    this.keyword = this.keyword.trim();
    this.router.navigate(['./'], { queryParams: { keyword: this.keyword }, relativeTo: this.route });
  }

  protected updateBreadcrumb(breadcrumbData?: BreadcrumbData): void {
    this.breadcrumbData.list = [{
      label: '类别管理',
      url: '',
      tooltip: '类别管理'
    }, {
      label: this.titleMap[this.taxonomyType],
      url: `taxonomy/${this.taxonomyType}`,
      tooltip: this.titleMap[this.taxonomyType]
    }];
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private fetchData() {
    const param: TaxonomyQueryParam = {
      type: this.taxonomyType,
      page: this.page,
      pageSize: this.pageSize,
      orders: this.orders
    };
    if (this.status !== null && this.status !== undefined) {
      param.status = this.status;
    }
    if (this.keyword) {
      param.keyword = this.keyword;
    }
    const latestParam = JSON.stringify(param);
    if (latestParam === this.lastParam) {
      return;
    }
    this.loading = true;
    this.resetCheckedStatus();
    this.lastParam = latestParam;
    this.taxonomyService.getTaxonomies(param).subscribe((res) => {
      this.loading = false;
      this.taxonomyList = res.taxonomies || [];
      this.page = res.page || 1;
      this.total = res.total || 0;
    });
  }

  private refreshCheckedStatus() {
    this.allChecked = this.taxonomyList.every((item) => this.checkedMap[item.taxonomyId]) || false;
    this.indeterminate = this.taxonomyList.some((item) => this.checkedMap[item.taxonomyId]) && !this.allChecked || false;
  }

  private resetCheckedStatus() {
    this.allChecked = false;
    this.indeterminate = false;
    this.checkedMap = {};
  }
}
