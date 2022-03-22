import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { CommentStatus } from '../../../config/common.enum';
import { ListComponent } from '../../../core/list.component';
import { OptionEntity } from '../../../interfaces/option.interface';
import { OptionsService } from '../../../services/options.service';
import { CommentEntity, CommentQueryParam } from '../comment.interface';
import { CommentService } from '../comment.service';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.less']
})
export class CommentListComponent extends ListComponent implements OnInit, OnDestroy {
  commentList: CommentEntity[] = [];
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

  private status!: CommentStatus;
  private orders: string[][] = [];
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
    private message: NzMessageService
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
      this.status = <CommentStatus>(queryParams.get('status')?.trim() || '');
      this.fetchComments();
    });
  }

  ngOnDestroy(): void {
    this.optionsListener.unsubscribe();
  }

  searchComments(event?: KeyboardEvent) {
    if (event && event.key !== 'Enter') {
      return;
    }
    this.keyword = this.keyword.trim();
    if (!this.keyword) {
      this.message.error('请输入关键词');
      return;
    }
    this.router.navigate(['./'], { queryParams: { keyword: this.keyword }, relativeTo: this.route });
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
    this.fetchComments();
  }

  onAllChecked(checked: boolean) {
    this.commentList.forEach((comment) => {
      this.checkedMap[comment.commentId] = checked;
    });
    this.allChecked = checked;
  }

  onItemChecked(commentId: string, checked: boolean) {
    this.checkedMap[commentId] = checked;
    this.refreshCheckedStatus();
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

  private refreshCheckedStatus() {
    this.allChecked = this.commentList.every((comment) => this.checkedMap[comment.commentId]) || false;
    this.indeterminate = this.commentList.some((comment) => this.checkedMap[comment.commentId]) && !this.allChecked || false;
  }

  private fetchComments() {
    const param: CommentQueryParam = {
      page: this.page,
      pageSize: this.pageSize,
      orders: this.orders,
      from: 'admin'
    };
    if (this.keyword) {
      param.keyword = this.keyword;
    }
    if (this.status) {
      param.status = this.status;
    }
    const latestParam = JSON.stringify(param);
    if (latestParam === this.lastParam) {
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

  private resetCheckedStatus() {
    this.allChecked = false;
    this.indeterminate = false;
    this.checkedMap = {};
  }
}
