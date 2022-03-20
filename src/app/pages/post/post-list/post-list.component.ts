import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { BaseComponent } from '../../../core/base.component';
import { OptionEntity } from '../../../interfaces/option.interface';
import { PostList, PostQueryParam } from '../../../interfaces/post.interface';
import { OptionsService } from '../../../services/options.service';
import { PostsService } from '../../../services/posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.less']
})
export class PostListComponent extends BaseComponent implements OnInit {
  postList: PostList = {};
  page: number = 1;
  total: number = 0;
  keyword: string = '';
  category: string = '';
  tag: string = '';
  year: string = '';
  month: string = '';
  allChecked = false;
  checkedMap: Record<string, boolean> = {};

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: true,
    list: []
  };

  private options: OptionEntity = {};
  private optionsListener!: Subscription;
  private paramListener!: Subscription;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionsService: OptionsService,
    private postsService: PostsService,
    private route: ActivatedRoute
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
    this.paramListener = this.route.queryParamMap.pipe(
      tap((queryParams) => {
        this.page = Number(queryParams.get('page')) || 1;
        this.category = queryParams.get('category')?.trim() || '';
        this.tag = queryParams.get('tag')?.trim() || '';
        this.year = queryParams.get('year')?.trim() || '';
        this.month = queryParams.get('month')?.trim() || '';
        this.keyword = queryParams.get('keyword')?.trim() || '';
      })
    ).subscribe(() => {
      this.fetchPosts();
    });
  }

  ngOnDestroy() {
    this.optionsListener.unsubscribe();
    this.paramListener.unsubscribe();
  }

  checkAll(checked: boolean) {

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

  private fetchPosts() {
    const param: PostQueryParam = {
      page: this.page
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
    this.postsService.getPosts(param).subscribe((res) => {
      this.postList = res.postList || {};
      this.page = this.postList.page || 1;
      this.total = this.postList.total || 0;
    });
  }
}
