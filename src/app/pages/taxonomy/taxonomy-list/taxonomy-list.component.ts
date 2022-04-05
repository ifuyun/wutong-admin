import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { TaxonomyStatus, TaxonomyType } from '../../../config/common.enum';
import {
  POST_STATUS,
  TAXONOMY_DESCRIPTION_LENGTH,
  TAXONOMY_NAME_LENGTH,
  TAXONOMY_SLUG_LENGTH,
  TAXONOMY_STATUS,
  TAXONOMY_STATUS_LIST,
  TREE_ROOT_NODE_KEY
} from '../../../config/constants';
import { Message } from '../../../config/message.enum';
import { ResponseCode } from '../../../config/response-code.enum';
import { ListComponent } from '../../../core/list.component';
import { OptionEntity } from '../../../interfaces/option.interface';
import { OptionsService } from '../../../services/options.service';
import { TaxonomyModel, TaxonomyQueryParam, TaxonomySaveParam } from '../taxonomy.interface';
import { TaxonomyService } from '../taxonomy.service';

@Component({
  selector: 'app-taxonomy-list',
  templateUrl: './taxonomy-list.component.html',
  styleUrls: ['./taxonomy-list.component.less']
})
export class TaxonomyListComponent extends ListComponent implements OnInit, OnDestroy {
  @Input() taxonomyType!: TaxonomyType;
  @ViewChild('confirmModalContent') confirmModalContent!: TemplateRef<any>;

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
  checkedLength = 0;
  statusFilter: NzTableFilterList = [];
  trashEnabled = false;
  editModalVisible = false;
  activeTaxonomy!: TaxonomyModel;
  saveLoading = false;
  taxonomyStatusList = TAXONOMY_STATUS_LIST.map((item) => ({
    ...item,
    disabled: item.key === TaxonomyStatus.TRASH
  }));
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

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: true,
    list: []
  };

  private allTaxonomies!: TaxonomyModel[];
  private statuses!: TaxonomyStatus[];
  private initialized = false;
  private orders: string[][] = [];
  private lastParam: string = '';
  private deleteLoading = false;
  private countLoading = false;
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
    private message: NzMessageService,
    private modal: NzModalService
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
      this.statuses = <TaxonomyStatus[]>(queryParams.getAll('status') || []);
      this.initialized = false;
      this.initFilter();
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
    const currentFilter = filter.filter((item) => item.key === 'status' && item.value.length > 0);
    this.statuses = currentFilter.length > 0 ? currentFilter[0].value : [];
    this.fetchData();
  }

  onAllChecked(checked: boolean) {
    this.taxonomyList.forEach((item) => {
      this.checkedMap[item.taxonomyId] = checked;
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

  editTaxonomy(taxonomy?: TaxonomyModel | string) {
    if (!taxonomy || typeof taxonomy === 'string') {
      taxonomy = {
        name: '',
        slug: '',
        description: '',
        taxonomyId: '',
        parentId: taxonomy,
        status: TaxonomyStatus.PUBLISH,
        isRequired: 0
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
      parent: taxonomy.parentId || TREE_ROOT_NODE_KEY,
      order: typeof taxonomy.termOrder === 'number' ? taxonomy.termOrder : '',
      status: taxonomy.status
    });
    this.refreshTaxonomyTreeStatus(this.activeTaxonomy.taxonomyId);
    this.resetFormStatus(this.taxonomyForm);
    this.editModalVisible = true;
  }

  closeEditModal() {
    this.editModalVisible = false;
  }

  saveTaxonomy() {
    const { value, valid } = this.validateForm(this.taxonomyForm);
    if (!valid) {
      return;
    }
    const saveFn = () => {
      this.saveLoading = true;
      const taxonomyData: TaxonomySaveParam = {
        taxonomyId: this.activeTaxonomy.taxonomyId,
        type: this.taxonomyType,
        name: value.name,
        slug: this.taxonomyType === TaxonomyType.TAG ? value.name : value.slug,
        description: this.taxonomyType === TaxonomyType.TAG ? value.name : value.description,
        parentId: !value.parent || value.parent === TREE_ROOT_NODE_KEY ? '' : value.parent,
        termOrder: value.order,
        status: value.status
      };
      this.taxonomyService.saveTaxonomy(taxonomyData).subscribe((res) => {
        this.saveLoading = false;
        if (res.code === ResponseCode.SUCCESS) {
          this.message.success(Message.SUCCESS);
          this.fetchData(true);
          this.fetchAllTaxonomies(true);
          this.closeEditModal();
        }
      });
    };
    if (this.taxonomyType === TaxonomyType.TAG || !this.activeTaxonomy.taxonomyId || value.status === this.activeTaxonomy.status) {
      saveFn();
    } else {
      let modalContent: string;
      switch (value.status) {
        case TaxonomyStatus.PUBLISH:
          modalContent = '将分类设为公开，其所有祖先分类也将同步设为公开。';
          break;
        case TaxonomyStatus.PRIVATE:
          modalContent = `将分类设为${TAXONOMY_STATUS[TaxonomyStatus.PRIVATE]}，` +
            `其所有${TAXONOMY_STATUS[TaxonomyStatus.PUBLISH]}的后代分类和${TAXONOMY_STATUS[TaxonomyStatus.TRASH]}的祖先分类` +
            `也将同步变更为${TAXONOMY_STATUS[TaxonomyStatus.PRIVATE]}。`;
          if (this.activeTaxonomy.status === TaxonomyStatus.PUBLISH) {
            modalContent += `且，将影响其和所有后代分类关联的${this.taxonomyType === TaxonomyType.POST ? '文章' : '链接'}的公开状态。`;
          }
          break;
        default:
          modalContent = `将分类设为${TAXONOMY_STATUS[value.status]}，其所有后代分类也将同步设为${TAXONOMY_STATUS[value.status]}`;
      }
      this.modal.warning({
        nzTitle: '注意',
        nzContent: modalContent,
        nzOkDanger: true,
        nzOnOk: () => saveFn()
      });
    }
  }

  deleteTaxonomies(taxonomy?: TaxonomyModel) {
    if (taxonomy?.isRequired) {
      this.message.error(`分类"${taxonomy.name}"为基础数据，不允许删除`);
      return;
    }
    const checkedIds: string[] = taxonomy ? [taxonomy.taxonomyId]
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
        this.taxonomyService.deleteTaxonomies(this.taxonomyType, checkedIds).subscribe((res) => {
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

  updateAllCount(type: TaxonomyType) {
    let modalContent: string;
    switch (type) {
      case TaxonomyType.LINK:
        modalContent = '确定更新全部链接分类的链接数量吗？';
        break;
      case TaxonomyType.TAG:
        modalContent = '确定更新全部标签的内容数量吗？';
        break;
      default:
        modalContent = '确定更新全部文章分类的内容数量吗？';
    }
    const confirmModal = this.modal.confirm({
      nzTitle: '确定更新吗？',
      nzContent: modalContent,
      nzOkDanger: false,
      nzOkLoading: this.countLoading,
      nzOnOk: () => {
        this.countLoading = true;
        this.countListener = this.taxonomyService.updateAllCount(type).subscribe((res) => {
          this.countLoading = false;
          if (res.code === ResponseCode.SUCCESS) {
            confirmModal.destroy();
            this.message.success(Message.SUCCESS);
            this.fetchData(true);
          }
        });
        return false;
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
    if (this.statuses && this.statuses.length > 0) {
      param.status = this.statuses;
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

  private fetchAllTaxonomies(force = false) {
    if (this.allTaxonomies && !force) {
      return;
    }
    this.allTaxonomiesListener = this.taxonomyService.getTaxonomies({
      type: this.taxonomyType,
      status: [TaxonomyStatus.PUBLISH, TaxonomyStatus.PRIVATE],
      pageSize: 0
    }).subscribe((res) => {
      this.allTaxonomies = res.taxonomies || [];
      this.taxonomyTree[0].children = this.taxonomyService.generateTaxonomyTree(this.allTaxonomies);
    });
  }

  private initFilter() {
    this.statusFilter = Object.keys(TAXONOMY_STATUS).map((key) => ({
      text: POST_STATUS[key],
      value: key,
      byDefault: this.statuses.includes(<TaxonomyStatus>key)
    }));
  }

  private refreshTaxonomyTreeStatus(current?: string) {
    const iterator = (nodes: NzTreeNodeOptions[], isParentDisabled: boolean) => {
      nodes.forEach((node) => {
        let isDisabled = false;
        if (
          node.key !== TREE_ROOT_NODE_KEY && (
            node['status'] && node['status'] !== TaxonomyStatus.PUBLISH ||
            node['taxonomyId'] === current ||
            isParentDisabled
          )
        ) {
          isDisabled = true;
          node.disabled = true;
          node.expanded = node['taxonomyId'] === current;
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
    this.trashEnabled = false;
    this.checkedMap = {};
  }

  private refreshBtnStatus() {
    const checkedList = this.taxonomyList.filter((item) => this.checkedMap[item.taxonomyId]);
    if (checkedList.length > 0) {
      this.trashEnabled = checkedList.every(
        (item) => this.checkedMap[item.taxonomyId] && item.status !== TaxonomyStatus.TRASH && !item.isRequired);
    } else {
      this.trashEnabled = false;
    }
  }
}
