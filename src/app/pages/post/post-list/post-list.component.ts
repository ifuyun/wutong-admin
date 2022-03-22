import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { PostStatus } from '../../../config/common.enum';
import { ListComponent } from '../../../core/list.component';
import { OptionEntity } from '../../../interfaces/option.interface';
import { OptionsService } from '../../../services/options.service';
import { Post, PostQueryParam } from '../post.interface';
import { PostService } from '../post.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.less']
})
export class PostListComponent extends ListComponent implements OnInit, OnDestroy {
  postList: Post[] = [];
  page: number = 1;
  total: number = 0;
  pageSize = 10;
  loading = true;
  keyword: string = '';
  allChecked = false;
  indeterminate = false;
  checkedMap: Record<string, boolean> = {};

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: true,
    list: []
  };

  private category: string = '';
  private tag: string = '';
  private year: string = '';
  private month: string = '';
  private status!: PostStatus;
  private orders: string[][] = [];
  private lastParam: string = '';
  private options: OptionEntity = {};
  private optionsListener!: Subscription;
  private paramListener!: Subscription;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionsService: OptionsService,
    private postService: PostService,
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
    this.titles = ['文章列表', '文章管理', this.options['site_name']];
    this.updateTitle();
    this.updateBreadcrumb();
    this.paramListener = this.route.queryParamMap.subscribe((queryParams) => {
      this.page = Number(queryParams.get('page')) || 1;
      this.category = queryParams.get('category')?.trim() || '';
      this.tag = queryParams.get('tag')?.trim() || '';
      this.year = queryParams.get('year')?.trim() || '';
      this.month = queryParams.get('month')?.trim() || '';
      this.keyword = queryParams.get('keyword')?.trim() || '';
      this.status = <PostStatus>(queryParams.get('status')?.trim() || '');
      this.fetchPosts();
    });
  }

  ngOnDestroy() {
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
    this.fetchPosts();
  }

  onAllChecked(checked: boolean) {
    this.postList.forEach((post) => {
      this.checkedMap[post.post.postId] = checked;
    });
    this.allChecked = checked;
  }

  onItemChecked(postId: string, checked: boolean) {
    this.checkedMap[postId] = checked;
    this.refreshCheckedStatus();
  }

  searchPosts(event?: KeyboardEvent) {
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

  protected updateBreadcrumb(): void {
    this.breadcrumbData.list = [{
      label: '文章管理',
      url: 'post',
      tooltip: '文章管理'
    }, {
      label: '文章列表',
      url: 'post',
      tooltip: '文章列表'
    }];
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private refreshCheckedStatus() {
    this.allChecked = this.postList.every((post) => this.checkedMap[post.post.postId]) || false;
    this.indeterminate = this.postList.some((post) => this.checkedMap[post.post.postId]) && !this.allChecked || false;
  }

  private resetCheckedStatus() {
    this.allChecked = false;
    this.indeterminate = false;
    this.checkedMap = {};
  }

  private fetchPosts() {
    const param: PostQueryParam = {
      page: this.page,
      pageSize: this.pageSize,
      orders: this.orders,
      from: 'admin'
    };
    if (this.keyword) {
      param.keyword = this.keyword;
    }
    if (this.category) {
      param.category = this.category;
    }
    if (this.tag) {
      param.tag = this.tag;
    }
    if (this.year) {
      param.year = this.year;
      if (this.month) {
        param.month = this.month;
      }
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
    this.postService.getPosts(param).subscribe((res) => {
      this.loading = false;
      this.postList = res.postList.posts || [];
      this.page = res.postList.page || 1;
      this.total = res.postList.total || 0;
    });
  }
}
