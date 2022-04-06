import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTableFilterList } from 'ng-zorro-antd/table/src/table.types';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { LinkStatus, LinkTarget, LinkScope } from '../../../config/common.enum';
import { LINK_STATUS, LINK_TARGET, LINK_SCOPE } from '../../../config/constants';
import { ListComponent } from '../../../core/list.component';
import { OptionEntity } from '../../../interfaces/option.interface';
import { OptionsService } from '../../../services/options.service';
import { LinkModel, LinkQueryParam } from '../link.interface';
import { LinkService } from '../link.service';

@Component({
  selector: 'app-link-list',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.less']
})
export class LinkListComponent extends ListComponent implements OnInit, OnDestroy {
  linkList: LinkModel[] = [];
  page: number = 1;
  total: number = 0;
  pageSize: number = 10;
  loading: boolean = false;
  keyword: string = '';
  allChecked = false;
  indeterminate = false;
  checkedMap: Record<string, boolean> = {};
  scopeFilter: NzTableFilterList = [];
  targetFilter: NzTableFilterList = [];
  statusFilter: NzTableFilterList = [];

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: true,
    list: []
  };

  private scopes!: LinkScope | LinkScope[];
  private statuses!: LinkStatus[];
  private targets!: LinkTarget | LinkTarget[];
  private initialized = false;
  private orders: string[][] = [];
  private lastParam: string = '';
  private options: OptionEntity = {};
  private optionsListener!: Subscription;
  private paramListener!: Subscription;
  private linksListener!: Subscription;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionsService: OptionsService,
    private linkService: LinkService,
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
    this.paramListener = this.route.queryParamMap.subscribe((queryParams) => {
      this.page = Number(queryParams.get('page')) || 1;
      this.keyword = queryParams.get('keyword')?.trim() || '';
      this.scopes = <LinkScope[]>(queryParams.getAll('scope') || []);
      this.statuses = <LinkStatus[]>(queryParams.getAll('status') || []);
      this.targets = <LinkTarget[]>(queryParams.getAll('target') || []);
      this.initialized = false;
      this.updatePageInfo();
      this.initFilter();
      this.fetchData();
    });
  }

  ngOnDestroy(): void {
    this.optionsListener.unsubscribe();
    this.paramListener.unsubscribe();
    this.linksListener.unsubscribe();
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    if (!this.initialized) {
      this.initialized = true;
      return;
    }
    const { pageSize, pageIndex, sort, filter } = params;
    this.pageSize = pageSize;
    this.page = pageIndex;
    this.orders = [];
    sort.forEach((item) => {
      if (item.value) {
        this.orders.push([item.key, item.value === 'descend' ? 'desc' : 'asc']);
      }
    });
    filter.forEach((item) => {
      if (item.key === 'visible') {
        this.scopes = item.value;
      } else if (item.key === 'status') {
        this.statuses = item.value;
      } else if (item.key === 'target') {
        this.targets = item.value;
      }
    });
    this.fetchData();
  }

  onAllChecked(checked: boolean) {
    this.linkList.forEach((item) => {
      this.checkedMap[item.linkId] = checked;
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

  deleteLinks(linkId?: string) {

  }

  protected updateBreadcrumb(breadcrumbData?: BreadcrumbData): void {
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private fetchData(force = false) {
    const param: LinkQueryParam = {
      page: this.page,
      pageSize: this.pageSize,
      orders: this.orders,
    };
    if (this.scopes && this.scopes.length > 0) {
      param.visible = this.scopes;
    }
    if (this.statuses && this.statuses.length > 0) {
      param.status = this.statuses;
    }
    if (this.targets && this.targets.length > 0) {
      param.target = this.targets;
    }
    if (this.keyword) {
      param.keyword = this.keyword;
    }
    const latestParam = JSON.stringify(param);
    if (latestParam === this.lastParam && !force) {
      return;
    }
    this.loading = true;
    this.resetCheckedStatus();
    this.lastParam = latestParam;
    this.linksListener = this.linkService.getLinks(param).subscribe((res) => {
      this.loading = false;
      this.linkList = res.links || [];
      this.page = res.page || 1;
      this.total = res.total || 0;
    });
  }

  private initFilter() {
    this.scopeFilter = Object.keys(LINK_SCOPE).map((key) => ({
      text: LINK_SCOPE[key],
      value: key,
      byDefault: this.scopes.includes(<LinkScope>key)
    }));
    this.statusFilter = Object.keys(LINK_STATUS).map((key) => ({
      text: LINK_STATUS[key],
      value: key,
      byDefault: this.statuses.includes(<LinkStatus>key)
    }));
    this.targetFilter = Object.keys(LINK_TARGET).map((key) => ({
      text: LINK_TARGET[key],
      value: key,
      byDefault: this.targets.includes(<LinkTarget>key)
    }));
  }

  private updatePageInfo() {
    this.titles = ['链接列表', '链接管理', this.options['site_name']];
    this.breadcrumbData.list = [{
      label: '链接管理',
      url: 'link',
      tooltip: '链接管理'
    }, {
      label: '链接列表',
      url: 'link',
      tooltip: '链接列表'
    }];
    this.updateTitle();
    this.updateBreadcrumb();
  }

  private refreshCheckedStatus() {
    this.allChecked = this.linkList.every((item) => this.checkedMap[item.linkId]) || false;
    this.indeterminate = this.linkList.some((item) => this.checkedMap[item.linkId]) && !this.allChecked || false;
  }

  private resetCheckedStatus() {
    this.allChecked = false;
    this.indeterminate = false;
    this.checkedMap = {};
  }
}
