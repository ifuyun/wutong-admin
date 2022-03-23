import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTableFilterList } from 'ng-zorro-antd/table/src/table.types';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { CommentStatus } from '../../../config/common.enum';
import { COMMENT_STATUS } from '../../../config/constants';
import { Message } from '../../../config/message.enum';
import { ResponseCode } from '../../../config/response-code.enum';
import { ListComponent } from '../../../core/list.component';
import { OptionEntity } from '../../../interfaces/option.interface';
import { OptionsService } from '../../../services/options.service';
import { CommentModel, CommentQueryParam } from '../comment.interface';
import { CommentService } from '../comment.service';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.less']
})
export class CommentListComponent extends ListComponent implements OnInit, OnDestroy {
  @ViewChild('confirmModalContent') confirmModalContent!: TemplateRef<any>;

  commentList: CommentModel[] = [];
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
  operation!: CommentStatus | null;

  pendingEnabled = false;
  trashEnabled = false;

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: true,
    list: []
  };

  private checkedCommentIds: string[] = [];
  private status!: CommentStatus[];
  private orders: string[][] = [];
  /* antd初始化和重置filter时都会触发nzQueryParams，因此设置状态限制请求数 */
  private initialized = false;
  private lastParam: string = '';
  private options: OptionEntity = {};
  private optionsListener!: Subscription;
  private paramListener!: Subscription;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionsService: OptionsService,
    private commentService: CommentService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService
  ) {
    super();
  }

  ngOnInit(): void {
    this.optionsListener = this.optionsService.options$.subscribe((options) => {
      this.options = options;
    });
    this.titles = ['评论列表', '评论管理', this.options['site_name']];
    this.updateTitle();
    this.updateBreadcrumb();
    this.paramListener = this.route.queryParamMap.subscribe((queryParams) => {
      this.page = Number(queryParams.get('page')) || 1;
      this.keyword = queryParams.get('keyword')?.trim() || '';
      this.status = <CommentStatus[]>(queryParams.getAll('status') || []);
      this.initialized = false;
      this.initFilter();
      this.fetchData();
    });
  }

  ngOnDestroy(): void {
    this.optionsListener.unsubscribe();
    this.paramListener.unsubscribe();
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
    this.status = currentFilter.length > 0 ? currentFilter[0].value : [];
    this.fetchData();
  }

  onAllChecked(checked: boolean) {
    this.commentList.forEach((item) => {
      this.checkedMap[item.commentId] = checked;
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

  confirmOperation(action: string, commentIds?: string[]) {
    this.checkedCommentIds = commentIds || Object.keys(this.checkedMap).filter((item) => this.checkedMap[item]);
    if (this.checkedCommentIds.length < 1) {
      this.message.error('请先选择至少一条评论');
      return;
    }
    this.operation = <CommentStatus>action;
    this.checkedLength = this.checkedCommentIds.length;
    this.modal.confirm({
      nzContent: this.confirmModalContent,
      nzClassName: 'confirm-with-no-title',
      nzOkDanger: this.operation === CommentStatus.TRASH,
      nzOnOk: () => this.auditComments(),
      nzOnCancel: () => {
        this.operation = null;
      }
    });
  }

  auditComments() {
    this.commentService.auditComments({
      commentIds: this.checkedCommentIds,
      action: <CommentStatus>this.operation
    }).subscribe((res) => {
      this.operation = null;
      if (res.code !== ResponseCode.SUCCESS) {
        this.message.error(res.message || Message.UNKNOWN_ERROR);
      } else {
        this.message.success(Message.SUCCESS);
        this.fetchData(true);
      }
    });
  }

  protected updateBreadcrumb(breadcrumbData?: BreadcrumbData): void {
    this.breadcrumbData.list = [{
      label: '评论管理',
      url: 'comment',
      tooltip: '评论管理'
    }, {
      label: '评论列表',
      url: 'comment',
      tooltip: '评论列表'
    }];
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private fetchData(force = false) {
    const param: CommentQueryParam = {
      page: this.page,
      pageSize: this.pageSize,
      orders: this.orders,
      from: 'admin'
    };
    if (this.status && this.status.length > 0) {
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
    this.commentService.getComments(param).subscribe((res) => {
      this.loading = false;
      this.commentList = res.comments || [];
      this.page = res.page || 1;
      this.total = res.total || 0;
    });
  }

  private initFilter() {
    this.statusFilter = Object.keys(COMMENT_STATUS).map((key) => ({
      text: COMMENT_STATUS[key],
      value: key,
      byDefault: this.status.includes(<CommentStatus>key)
    }));
  }

  private refreshCheckedStatus() {
    this.allChecked = this.commentList.every((item) => this.checkedMap[item.commentId]) || false;
    this.indeterminate = this.commentList.some((item) => this.checkedMap[item.commentId]) && !this.allChecked || false;
  }

  private resetCheckedStatus() {
    this.allChecked = false;
    this.indeterminate = false;
    this.pendingEnabled = false;
    this.trashEnabled = false;
    this.checkedMap = {};
  }

  private refreshBtnStatus() {
    const checkedList = this.commentList.filter((item) => this.checkedMap[item.commentId]);
    if (checkedList.length > 0) {
      this.pendingEnabled = checkedList.every(
        (item) => this.checkedMap[item.commentId] && item.commentStatus === CommentStatus.PENDING);
      this.trashEnabled = checkedList.every(
        (item) => this.checkedMap[item.commentId] && item.commentStatus !== CommentStatus.TRASH);
    } else {
      this.pendingEnabled = false;
      this.trashEnabled = false;
    }
  }
}
