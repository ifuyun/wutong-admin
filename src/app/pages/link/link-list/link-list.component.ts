import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTableFilterList } from 'ng-zorro-antd/table/src/table.types';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { LinkScope, LinkStatus, LinkTarget, TaxonomyStatus, TaxonomyType } from '../../../config/common.enum';
import {
  LINK_DESCRIPTION_LENGTH,
  LINK_NAME_LENGTH,
  LINK_SCOPE,
  LINK_STATUS,
  LINK_TARGET,
  LINK_URL_LENGTH
} from '../../../config/constants';
import { Message } from '../../../config/message.enum';
import { ResponseCode } from '../../../config/response-code.enum';
import { ListComponent } from '../../../core/list.component';
import { OptionEntity } from '../../../interfaces/option.interface';
import { OptionsService } from '../../../services/options.service';
import { TaxonomyModel } from '../../taxonomy/taxonomy.interface';
import { TaxonomyService } from '../../taxonomy/taxonomy.service';
import { LinkModel, LinkQueryParam, LinkSaveParam } from '../link.interface';
import { LinkService } from '../link.service';

@Component({
  selector: 'app-link-list',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.less']
})
export class LinkListComponent extends ListComponent implements OnInit, OnDestroy {
  @ViewChild('confirmModalContent') confirmModalContent!: TemplateRef<any>;

  readonly maxNameLength = LINK_NAME_LENGTH;
  readonly maxUrlLength = LINK_URL_LENGTH;
  readonly maxDescriptionLength = LINK_DESCRIPTION_LENGTH;

  linkList: LinkModel[] = [];
  page: number = 1;
  total: number = 0;
  pageSize: number = 10;
  loading: boolean = false;
  keyword: string = '';
  allChecked = false;
  indeterminate = false;
  checkedMap: Record<string, boolean> = {};
  checkedLength = 0;
  scopeFilter: NzTableFilterList = [];
  targetFilter: NzTableFilterList = [];
  statusFilter: NzTableFilterList = [];
  trashEnabled = false;
  editModalVisible = false;
  activeLink!: LinkModel;
  saveLoading = false;
  linkForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(this.maxNameLength)]],
    url: ['', [Validators.required, Validators.maxLength(this.maxUrlLength)]],
    description: ['', [Validators.required, Validators.maxLength(this.maxDescriptionLength)]],
    scope: ['', [Validators.required]],
    status: [''],
    target: ['', [Validators.required]],
    order: ['', [Validators.required, Validators.pattern(/^\s*(\d|([1-9]\d{1,2}))\s*$/i)]],
    taxonomy: ['', [Validators.required]]
  });
  taxonomyTree: NzTreeNodeOptions[] = [];

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: true,
    list: []
  };

  private taxonomies!: TaxonomyModel[];
  private taxonomyId!: string;
  private scopes!: LinkScope | LinkScope[];
  private statuses!: LinkStatus[];
  private targets!: LinkTarget | LinkTarget[];
  private initialized = false;
  private orders: string[][] = [];
  private lastParam: string = '';
  private deleteLoading = false;
  private options: OptionEntity = {};
  private optionsListener!: Subscription;
  private paramListener!: Subscription;
  private linksListener!: Subscription;
  private taxonomiesListener!: Subscription;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionsService: OptionsService,
    private linkService: LinkService,
    private taxonomyService: TaxonomyService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private message: NzMessageService,
    private modal: NzModalService
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
      this.taxonomyId = queryParams.get('taxonomy')?.trim() || '';
      this.scopes = <LinkScope[]>(queryParams.getAll('scope') || []);
      this.statuses = <LinkStatus[]>(queryParams.getAll('status') || []);
      this.targets = <LinkTarget[]>(queryParams.getAll('target') || []);
      this.initialized = false;
      this.updatePageInfo();
      this.initFilter();
      this.fetchData();
    });
    this.fetchTaxonomies();
  }

  ngOnDestroy(): void {
    this.optionsListener.unsubscribe();
    this.paramListener.unsubscribe();
    this.linksListener.unsubscribe();
    this.taxonomiesListener?.unsubscribe();
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
    this.refreshBtnStatus();
  }

  onItemChecked(checkedKey: string, checked: boolean) {
    this.checkedMap[checkedKey] = checked;
    this.refreshCheckedStatus();
    this.refreshBtnStatus();
  }

  onSearch(event?: KeyboardEvent) {
    if (event && event.key !== 'Enter') {
      return;
    }
    this.keyword = this.keyword.trim();
    this.router.navigate(['./'], { queryParams: { keyword: this.keyword }, relativeTo: this.route });
  }

  editLink(link?: LinkModel) {
    if (!link) {
      link = {
        linkId: '',
        linkName: '',
        linkUrl: '',
        linkDescription: '',
        linkScope: LinkScope.HOMEPAGE,
        linkStatus: LinkStatus.NORMAL,
        linkTarget: LinkTarget.BLANK,
        linkOrder: 0
      };
    }
    this.activeLink = link;
    const taxonomy = link.taxonomies?.map((item) => item.taxonomyId);
    this.linkForm.setValue({
      name: link.linkName,
      url: link.linkUrl,
      description: link.linkDescription,
      scope: link.linkScope,
      status: link.linkStatus,
      target: link.linkTarget,
      order: link.linkOrder,
      taxonomy: taxonomy?.[0] || ''
    });

    this.resetFormStatus(this.linkForm);
    this.editModalVisible = true;
  }

  closeEditModal() {
    this.editModalVisible = false;
  }

  saveLink() {
    const { value, valid } = this.validateForm(this.linkForm);
    if (!valid) {
      return;
    }
    this.saveLoading = true;
    const formData: LinkSaveParam = {
      linkId: this.activeLink.linkId,
      linkName: value.name,
      linkUrl: value.url,
      linkDescription: value.description,
      linkScope: value.scope,
      linkStatus: value.status,
      linkTarget: value.target,
      linkOrder: value.order,
      linkTaxonomy: value.taxonomy,
    };
    this.linkService.saveLink(formData).subscribe((res) => {
      this.saveLoading = false;
      if (res.code === ResponseCode.SUCCESS) {
        this.message.success(Message.SUCCESS);
        this.fetchData(true);
        this.closeEditModal();
      }
    });
  }

  deleteLinks(linkId?: string) {
    const checkedIds: string[] = linkId ? [linkId]
      : Object.keys(this.checkedMap).filter((item) => this.checkedMap[item]);
    if (checkedIds.length < 1) {
      this.message.error('请先选择至少一条记录');
      return;
    }
    this.checkedLength = checkedIds.length;
    const confirmModal = this.modal.confirm({
      nzTitle: '确定删除吗？',
      nzContent: this.confirmModalContent,
      nzOkDanger: true,
      nzOkLoading: this.deleteLoading,
      nzOnOk: () => {
        this.deleteLoading = true;
        this.linkService.deleteLinks(checkedIds).subscribe((res) => {
          this.deleteLoading = false;
          confirmModal.destroy();
          if (res.code === ResponseCode.SUCCESS) {
            this.message.success(Message.SUCCESS);
            this.fetchData(true);
          }
        });
        return false;
      }
    });
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
    if (this.taxonomyId) {
      param.taxonomyId = this.taxonomyId;
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

  private fetchTaxonomies(force = false) {
    if (this.taxonomies && !force) {
      return;
    }
    this.taxonomiesListener = this.taxonomyService.getTaxonomies({
      type: TaxonomyType.LINK,
      status: [TaxonomyStatus.PUBLISH, TaxonomyStatus.PRIVATE],
      pageSize: 0
    }).subscribe((res) => {
      this.taxonomies = res.taxonomies || [];
      this.taxonomyTree = this.taxonomyService.generateTaxonomyTree(this.taxonomies);
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
    this.trashEnabled = false;
    this.checkedMap = {};
  }

  private refreshBtnStatus() {
    const checkedList = this.linkList.filter((item) => this.checkedMap[item.linkId]);
    if (checkedList.length > 0) {
      this.trashEnabled = checkedList.every(
        (item) => this.checkedMap[item.linkId] && item.linkStatus !== LinkStatus.TRASH);
    } else {
      this.trashEnabled = false;
    }
  }
}
