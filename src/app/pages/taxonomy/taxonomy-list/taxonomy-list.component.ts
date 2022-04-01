import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { TaxonomyStatus, TaxonomyType } from '../../../config/common.enum';
import { TAXONOMY_DESCRIPTION_LENGTH, TAXONOMY_NAME_LENGTH, TAXONOMY_SLUG_LENGTH, TAXONOMY_STATUS_LIST, TREE_ROOT_NODE_KEY } from '../../../config/constants';
import { Message } from '../../../config/message.enum';
import { ResponseCode } from '../../../config/response-code.enum';
import { ListComponent } from '../../../core/list.component';
import { OptionEntity } from '../../../interfaces/option.interface';
import { OptionsService } from '../../../services/options.service';
import { TaxonomyModel, TaxonomyQueryParam } from '../taxonomy.interface';
import { TaxonomyService } from '../taxonomy.service';

@Component({
  selector: 'app-taxonomy-list',
  templateUrl: './taxonomy-list.component.html',
  styleUrls: ['./taxonomy-list.component.less']
})
export class TaxonomyListComponent extends ListComponent implements OnInit, OnDestroy {
  @Input() taxonomyType!: TaxonomyType;

  readonly maxNameLength = TAXONOMY_NAME_LENGTH;
  readonly maxSlugLength = TAXONOMY_SLUG_LENGTH;
  readonly maxDescriptionLength = TAXONOMY_DESCRIPTION_LENGTH;

  taxonomyList: TaxonomyModel[] = [];
  page: number = 1;
  total: number = 0;
  pageSize: number = 10;
  loading: boolean = false;
  keyword: string = '';
  allChecked = false;
  indeterminate = false;
  checkedMap: Record<string, boolean> = {};
  editModalVisible = false;
  activeTaxonomy!: TaxonomyModel;
  saveLoading = false;
  taxonomyStatusList = TAXONOMY_STATUS_LIST;
  taxonomyForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(this.maxNameLength)]],
    slug: ['', [Validators.required, Validators.maxLength(this.maxSlugLength)]],
    description: ['', [Validators.required, Validators.maxLength(this.maxDescriptionLength)]],
    parent: [''],
    order: ['', [Validators.required, Validators.pattern(/^\s*(\d|([1-9]\d{1,4}))\s*$/i)]],
    status: ['']
  });
  taxonomyTree: NzTreeNodeOptions[] = [{
    title: '根节点',
    key: TREE_ROOT_NODE_KEY,
    children: []
  }];
  countLoading = false;

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: true,
    list: []
  };

  private allTaxonomies!: TaxonomyModel[];
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
  private taxonomyListener!: Subscription;
  private allTaxonomiesListener!: Subscription;
  private countListener!: Subscription;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionsService: OptionsService,
    private taxonomyService: TaxonomyService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
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
      this.status = <TaxonomyStatus>queryParams.get('status')?.trim();
      this.fetchData();
      this.taxonomyType !== TaxonomyType.TAG && this.fetchAllTaxonomies();
    });
  }

  ngOnDestroy(): void {
    this.optionsListener.unsubscribe();
    this.paramListener.unsubscribe();
    this.taxonomyListener.unsubscribe();
    this.allTaxonomiesListener?.unsubscribe();
    this.countListener?.unsubscribe();
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

  editTaxonomy(taxonomy?: TaxonomyModel | string) {
    if (!taxonomy || typeof taxonomy === 'string') {
      taxonomy = {
        name: '',
        slug: '',
        description: '',
        taxonomyId: '',
        parentId: taxonomy || TREE_ROOT_NODE_KEY,
        status: TaxonomyStatus.PUBLISH
      };
    }
    if (this.taxonomyType === TaxonomyType.TAG) {
      taxonomy.termOrder = 0;
    }
    this.activeTaxonomy = taxonomy;
    this.taxonomyForm.setValue({
      name: taxonomy.name,
      slug: taxonomy.slug,
      description: taxonomy.description,
      parent: taxonomy.parentId,
      order: typeof taxonomy.termOrder === 'number' ? taxonomy.termOrder : '',
      status: taxonomy.status
    });
    this.refreshTaxonomyTreeStatus(this.activeTaxonomy.taxonomyId);
    this.resetFormStatus(this.taxonomyForm);
    this.editModalVisible = true;
  }

  deleteTaxonomies(taxonomyIds?: string[]) {

  }

  closeEditModal() {
    this.editModalVisible = false;
  }

  saveTaxonomy() {
    const { value, valid } = this.validateForm(this.taxonomyForm);
    if (!valid) {
      return;
    }
    this.saveLoading = true;
  }

  updateAllCount(type: TaxonomyType) {
    this.countLoading = true;
    this.countListener = this.taxonomyService.updateAllCount(type).subscribe((res) => {
      this.countLoading = false;
      if (res.code === ResponseCode.SUCCESS) {
        this.message.success(Message.SUCCESS);
        this.fetchData(true);
      }
    });
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

  private fetchData(force = false) {
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
    if (latestParam === this.lastParam && !force) {
      return;
    }
    this.loading = true;
    this.resetCheckedStatus();
    this.lastParam = latestParam;
    this.taxonomyListener = this.taxonomyService.getTaxonomies(param).subscribe((res) => {
      this.loading = false;
      this.taxonomyList = res.taxonomies || [];
      this.page = res.page || 1;
      this.total = res.total || 0;
    });
  }

  private fetchAllTaxonomies() {
    if (this.allTaxonomies) {
      return;
    }
    this.allTaxonomiesListener = this.taxonomyService.getTaxonomies({
      type: this.taxonomyType,
      status: [TaxonomyStatus.PUBLISH, TaxonomyStatus.PRIVATE],
      page: 1,
      pageSize: 0
    }).subscribe((res) => {
      this.allTaxonomies = res.taxonomies || [];
      this.taxonomyTree[0].children = this.taxonomyService.generateTaxonomyTree(this.allTaxonomies);
    });
  }

  private refreshTaxonomyTreeStatus(current?: string) {
    const iterator = (nodes: NzTreeNodeOptions[], isParentDisabled: boolean) => {
      nodes.forEach((node) => {
        let isDisabled = false;
        if (node['status'] && node['status'] !== TaxonomyStatus.PUBLISH || node['taxonomyId'] === current || isParentDisabled) {
          isDisabled = true;
          node.disabled = true;
          node.expanded = false;
        } else {
          node.disabled = false;
          node.expanded = true;
        }
        if (node.children && node.children.length > 0) {
          iterator(node.children, isDisabled);
        }
      });
    };
    iterator(this.taxonomyTree, false);
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
