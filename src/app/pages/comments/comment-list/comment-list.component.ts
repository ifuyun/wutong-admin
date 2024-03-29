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
import { CommentAction, CommentAuditAction, CommentStatus } from '../../../config/common.enum';
import { COMMENT_STATUS } from '../../../config/constants';
import { Message } from '../../../config/message.enum';
import { ResponseCode } from '../../../config/response-code.enum';
import { ListComponent } from '../../../core/list.component';
import { OptionEntity } from '../../options/option.interface';
import { OptionService } from '../../options/option.service';
import { PostModel } from '../../posts/post.interface';
import { PostService } from '../../posts/post.service';
import { Comment, CommentModel, CommentQueryParam } from '../comment.interface';
import { CommentService } from '../comment.service';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.less']
})
export class CommentListComponent extends ListComponent implements OnInit, OnDestroy {
  @ViewChild('confirmModalContent') confirmModalContent!: TemplateRef<any>;

  commentList: Comment[] = [];
  post!: PostModel | null;
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
  auditAction!: CommentAuditAction | null;
  pendingEnabled = false;
  trashEnabled = false;

  commentModalVisible = false;
  commentAction!: CommentAction;
  activeComment!: CommentModel;

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: true,
    list: []
  };

  private postId!: string;
  private statuses!: CommentStatus[];
  /* antd初始化和重置filter时都会触发nzQueryParams，因此设置状态限制请求数 */
  private initialized = false;
  private orders: string[][] = [];
  private lastParam: string = '';
  private auditLoading = false;
  private options: OptionEntity = {};
  private optionsListener!: Subscription;
  private paramListener!: Subscription;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionService: OptionService,
    private commentService: CommentService,
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
    private modal: NzModalService,
    private message: NzMessageService
  ) {
    super();
  }

  ngOnInit(): void {
    this.optionsListener = this.optionService.options$.subscribe((options) => {
      this.options = options;
    });
    this.titles = ['评论列表', '评论管理', this.options['site_name']];
    this.paramListener = this.route.queryParamMap.subscribe((queryParams) => {
      this.postId = queryParams.get('postId')?.trim() || '';
      this.page = Number(queryParams.get('page')) || 1;
      this.keyword = queryParams.get('keyword')?.trim() || '';
      this.statuses = <CommentStatus[]>(queryParams.getAll('status') || []);
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
    this.statuses = currentFilter.length > 0 ? currentFilter[0].value : [];
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

  auditComments(action: string, commentId?: string) {
    const checkedIds: string[] = commentId ? [commentId] : Object.keys(this.checkedMap).filter((item) => this.checkedMap[item]);
    if (checkedIds.length < 1) {
      this.message.error('请先选择至少一条评论');
      return;
    }
    this.auditAction = <CommentAuditAction>action;
    this.checkedLength = checkedIds.length;
    let actionDesc: string;
    switch (action) {
      case CommentAuditAction.RESOLVE:
        actionDesc = '批准';
        break;
      case CommentAuditAction.TRASH:
        actionDesc = '删除';
        break;
      case CommentAuditAction.SPAM:
        actionDesc = '标记为垃圾评论';
        break;
      default:
        actionDesc = '驳回';
    }
    const confirmModal = this.modal.confirm({
      nzTitle: `确定${actionDesc}吗？`,
      nzContent: this.confirmModalContent,
      nzOkDanger: this.auditAction === CommentAuditAction.TRASH,
      nzOkLoading: this.auditLoading,
      nzAutofocus: 'ok',
      nzOnOk: () => {
        this.auditLoading = true;
        this.commentService.auditComments({
          commentIds: checkedIds,
          action: <CommentAuditAction>this.auditAction
        }).subscribe((res) => {
          this.auditAction = null;
          this.auditLoading = false;
          confirmModal.destroy();
          if (res.code === ResponseCode.SUCCESS) {
            this.message.success(Message.SUCCESS);
            this.fetchData(true);
          }
        });
        return false;
      },
      nzOnCancel: () => {
        this.auditAction = null;
      }
    });
  }

  editComment(action: string, comment: CommentModel) {
    this.commentAction = <CommentAction>action;
    this.activeComment = comment;
    this.commentModalVisible = true;
  }

  onCommentSave() {
    this.fetchData(true);
  }

  closeCommentModal() {
    this.commentModalVisible = false;
  }

  protected updateBreadcrumb(): void {
    this.breadcrumbData.list = [{
      label: '评论管理',
      url: 'comment',
      tooltip: '评论管理'
    }, {
      label: '评论列表',
      url: 'comment',
      tooltip: '评论列表'
    }];
    if (this.post) {
      this.breadcrumbData.list.push({
        label: this.post.postTitle,
        url: '',
        tooltip: this.post.postTitle
      });
    }
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private fetchData(force = false) {
    const param: CommentQueryParam = {
      page: this.page,
      pageSize: this.pageSize,
      orders: this.orders,
      fa: 1
    };
    if (this.postId) {
      param.postId = this.postId;
    }
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
    this.lastParam = latestParam;
    this.resetCheckedStatus();
    if (this.postId) {
      this.postService.getPostById(this.postId).subscribe((post) => {
        this.post = post.post;
        this.updatePageInfo();
      });
    } else {
      this.post = null;
      this.updatePageInfo();
    }
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
      byDefault: this.statuses.includes(<CommentStatus>key)
    }));
  }

  private updatePageInfo() {
    this.updateTitle();
    this.updateBreadcrumb();
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
