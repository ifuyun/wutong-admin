import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { uniq } from 'lodash';
import { NzImage, NzImageService } from 'ng-zorro-antd/image';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTableFilterList } from 'ng-zorro-antd/table/src/table.types';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { CommentFlag, PostStatus, PostType, TaxonomyStatus, TaxonomyType } from '../../../config/common.enum';
import { COMMENT_FLAG, MAX_POST_CATEGORY_NUMBER, MAX_POST_TAG_NUMBER, POST_STATUS, TREE_ROOT_NODE_KEY } from '../../../config/constants';
import { ListComponent } from '../../../core/list.component';
import { OptionEntity } from '../../../interfaces/option.interface';
import { OptionsService } from '../../../services/options.service';
import { TaxonomyModel } from '../../taxonomy/taxonomy.interface';
import { TaxonomyService } from '../../taxonomy/taxonomy.service';
import { Post, PostArchiveDate, PostModel, PostQueryParam } from '../post.interface';
import { PostService } from '../post.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.less']
})
export class PostListComponent extends ListComponent implements OnInit, OnDestroy {
  @Input() postType!: PostType;

  postList: Post[] = [];
  page: number = 1;
  total: number = 0;
  pageSize = 10;
  loading = true;
  keyword: string = '';
  allChecked = false;
  indeterminate = false;
  checkedMap: Record<string, boolean> = {};
  checkedLength = 0;
  tableWidth!: string;
  statusFilter: NzTableFilterList = [];
  commentFlagFilter: NzTableFilterList = [];
  trashEnabled = false;
  postDateFilterVisible = false;
  postDateYear!: string;
  postDateMonth!: string;
  postDateYearList: { label: string, value: string }[] = [];
  postDateMonthList: { label: string, value: string }[] = [];
  categoryFilterVisible = false;
  postCategory!: string;
  postCategoryList: NzTreeNodeOptions[] = [{
    title: '全部',
    key: TREE_ROOT_NODE_KEY,
    children: []
  }];
  postCategoryExpanded: string[] = [];
  postModalVisible = false;
  activePost!: PostModel;
  saveLoading = false;
  postFormRowGutter = 16;
  maxExcerptLength = 140;
  maxCategoryNumber = MAX_POST_CATEGORY_NUMBER;
  maxTagNumber = MAX_POST_TAG_NUMBER;
  tagList: string[] = [];
  tagListLoading = false;
  tagSearchChange$ = new BehaviorSubject('');
  postForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    postDate: [''],
    category: [''],
    tag: [[]],
    status: [''],
    password: [''],
    commentFlag: [''],
    original: [''],
    source: [''],
    author: [''],
    copyrightType: [''],
    wechatCardFlag: [''],
    modifiedFlag: [''],
    excerpt: ['']
  });

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: true,
    list: []
  };

  private category: string = '';
  private tag: string = '';
  private year: string = '';
  private month: string = '';
  private statuses!: PostStatus[];
  private commentFlags!: CommentFlag[];
  private postDateList!: PostArchiveDate[];
  private taxonomies!: TaxonomyModel[];
  private taxonomyNodes!: NzTreeNodeOptions[];
  private orders: string[][] = [];
  private lastParam: string = '';
  private options: OptionEntity = {};
  private optionsListener!: Subscription;
  private paramListener!: Subscription;
  private archiveListener!: Subscription;
  private taxonomyListener!: Subscription;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionsService: OptionsService,
    private postService: PostService,
    private taxonomyService: TaxonomyService,
    private route: ActivatedRoute,
    private router: Router,
    private imageService: NzImageService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    super();
  }

  ngOnInit(): void {
    this.optionsListener = this.optionsService.options$.subscribe((options) => {
      this.options = options;
    });
    this.initPageInfo();
    this.updateTitle();
    this.updateBreadcrumb();
    this.paramListener = this.route.queryParamMap.subscribe((queryParams) => {
      this.page = Number(queryParams.get('page')) || 1;
      this.category = queryParams.get('category')?.trim() || '';
      this.tag = queryParams.get('tag')?.trim() || '';
      this.year = queryParams.get('year')?.trim() || '';
      const month = parseInt(queryParams.get('month')?.trim() || '', 10);
      this.month = isNaN(month) ? '' : month < 10 ? '0' + month : month.toString();
      this.keyword = queryParams.get('keyword')?.trim() || '';
      this.statuses = <PostStatus[]>(queryParams.getAll('status') || []);
      this.commentFlags = <CommentFlag[]>(queryParams.getAll('commentFlag') || []);
      this.initFilter();
      this.fetchArchiveDates();
      this.fetchCategories();
      this.fetchData();
    });
    this.initTagSearch();
  }

  ngOnDestroy() {
    this.optionsListener.unsubscribe();
    this.paramListener.unsubscribe();
    this.archiveListener.unsubscribe();
    this.taxonomyListener.unsubscribe();
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
    filter.forEach((item) => {
      if (item.key === 'postStatus') {
        this.statuses = item.value;
      } else if (item.key === 'commentFlag') {
        this.commentFlags = item.value;
      }
    });
    this.fetchData();
  }

  onAllChecked(checked: boolean) {
    this.postList.forEach((item) => {
      this.checkedMap[item.post.postId] = checked;
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

  onPostSearch(event?: KeyboardEvent) {
    if (event && event.key !== 'Enter') {
      return;
    }
    this.keyword = this.keyword.trim();
    this.router.navigate(['./'], { queryParams: { keyword: this.keyword }, relativeTo: this.route });
  }

  onPostDateYearChange(year: string, month?: string) {
    this.postDateMonth = month || '';
    this.postDateMonthList = this.postDateList.filter((item) => item.dateText.split('/')[0] === year)
      .map((item) => item.dateText.split('/')[1])
      .sort((a, b) => a < b ? 1 : -1)
      .map((item) => ({ label: `${item}月`, value: item }));
  }

  onPostDateFilterReset() {
    this.postDateYear = '';
    this.postDateMonth = '';
    this.postDateMonthList = [];
    this.postDateFilterVisible = false;
    this.onPostDateFilterChange();
  }

  onPostDateFilterOk() {
    this.postDateFilterVisible = false;
    this.onPostDateFilterChange();
  }

  onPostDateFilterVisibleChange(visible: boolean) {
    if (!visible) {
      this.onPostDateFilterChange();
    }
  }

  onCategoryFilterReset() {
    this.postCategory = '';
    this.categoryFilterVisible = false;
    this.onCategoryFilterChange();
  }

  onCategoryFilterOk() {
    this.categoryFilterVisible = false;
    this.onCategoryFilterChange();
  }

  onCategoryFilterVisibleChange(visible: boolean) {
    if (!visible) {
      this.onCategoryFilterChange();
    }
  }

  previewImage(url: string) {
    const images: NzImage[] = [{
      src: this.options['static_host'] + url
    }];
    this.imageService.preview(images);
  }

  showPostModal(post: PostModel) {
    this.activePost = post;
    this.resetFormStatus(this.postForm);
    this.postModalVisible = true;
  }

  closePostModal() {
    this.postModalVisible = false;
  }

  onTagSearch(keyword: string) {
    if (!keyword.trim()) {
      this.tagList = [];
      return;
    }
    this.tagListLoading = true;
    this.tagSearchChange$.next(keyword);
  }

  savePost() {

  }

  protected updateBreadcrumb(): void {
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private fetchData() {
    const param: PostQueryParam = {
      type: this.postType,
      page: this.page,
      pageSize: this.pageSize,
      orders: this.orders,
      fa: 1
    };
    if (this.keyword) {
      param.keyword = this.keyword;
    }
    if (this.category && this.category !== TREE_ROOT_NODE_KEY) {
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
    if (this.statuses && this.statuses.length > 0) {
      param.status = this.statuses;
    }
    if (this.commentFlags && this.commentFlags.length > 0) {
      param.commentFlag = this.commentFlags;
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
      res.postList = res.postList || {};
      this.postList = res.postList.posts || [];
      this.page = res.postList.page || 1;
      this.total = res.postList.total || 0;
    });
  }

  private fetchArchiveDates() {
    if (this.postDateList) {
      this.initPostDateFilter();
      return;
    }
    this.archiveListener = this.postService.getPostArchiveDates({
      showCount: false,
      limit: 0,
      postType: this.postType,
      fa: 1
    }).subscribe((res) => {
      this.postDateList = res;
      this.postDateYearList = uniq(
        this.postDateList.map((item) => item.dateText.split('/')[0])
      )
        .sort((a, b) => a < b ? 1 : -1)
        .map((item) => ({ label: `${item}年`, value: item }));
      this.initPostDateFilter();
    });
  }

  private fetchCategories() {
    if (this.taxonomies) {
      this.initCategoryFilter();
      return;
    }
    this.taxonomyListener = this.taxonomyService.getTaxonomies({
      type: TaxonomyType.POST,
      status: [TaxonomyStatus.OPEN, TaxonomyStatus.CLOSED],
      page: 1,
      pageSize: 0
    }).subscribe((res) => {
      this.taxonomies = res.taxonomies || [];
      this.taxonomyNodes = this.taxonomyService.generateTaxonomyTree(this.taxonomies);
      this.postCategoryList[0].children = this.taxonomyNodes;
      this.initCategoryFilter();
    });
  }

  private initFilter() {
    this.statusFilter = Object.keys(POST_STATUS).map((key) => ({
      text: POST_STATUS[key],
      value: key,
      byDefault: this.statuses.includes(<PostStatus>key)
    }));
    this.commentFlagFilter = Object.keys(COMMENT_FLAG).map((key) => ({
      text: COMMENT_FLAG[key],
      value: key,
      byDefault: this.commentFlags.includes(<CommentFlag>key)
    }));
  }

  private initPostDateFilter() {
    this.postDateYear = this.year;
    this.onPostDateYearChange(this.year, this.month);
  }

  private initCategoryFilter() {
    this.resetCategoryFilterStatus();
    this.postCategory = this.category;
    this.postCategoryExpanded = [TREE_ROOT_NODE_KEY];
    if (this.postCategory) {
      const curId = this.taxonomyService.getTaxonomyIdBySlug(this.taxonomies, this.postCategory);
      const parents = this.taxonomyService.getParentTaxonomies(this.taxonomies, curId)
        .map((item) => item.slug);
      this.postCategoryExpanded = this.postCategoryExpanded.concat(parents);
    }
  }

  private onPostDateFilterChange() {
    this.year = this.postDateYear;
    this.month = this.postDateMonth;
    this.fetchData();
  }

  private resetCategoryFilterStatus() {
    const iterator = (nodes: NzTreeNodeOptions[]) => {
      for (const node of nodes) {
        node.selected = false;
        node.expanded = false;
        if (node.children && node.children.length > 0) {
          iterator(node.children);
        }
      }
    };
    iterator(this.taxonomyNodes);
  }

  private onCategoryFilterChange() {
    this.category = this.postCategory;
    this.fetchData();
  }

  private initTagSearch() {
    const getTagList = (keyword: string): Observable<string[]> => this.taxonomyService.searchTags(keyword);
    const tagList$: Observable<string[]> = this.tagSearchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(switchMap(getTagList));
    tagList$.subscribe((data) => {
      this.tagList = data;
      this.tagListLoading = false;
    });
  }

  private initPageInfo() {
    this.titles = [this.options['site_name']];
    let pageTitle = '';
    switch (this.postType) {
      case PostType.PAGE:
        this.tableWidth = '1570px';
        pageTitle = '页面列表';
        this.titles.unshift('文章管理');
        this.breadcrumbData.list = [{
          label: '文章管理',
          url: 'post',
          tooltip: '文章管理'
        }, {
          label: pageTitle,
          url: 'post',
          tooltip: pageTitle
        }];
        break;
      case PostType.ATTACHMENT:
        this.tableWidth = '1000px';
        pageTitle = '素材列表';
        this.titles.unshift('素材管理');
        this.breadcrumbData.list = [{
          label: '素材管理',
          url: 'resource',
          tooltip: '素材管理'
        }, {
          label: pageTitle,
          url: 'resource',
          tooltip: pageTitle
        }];
        break;
      default:
        this.tableWidth = '1690px';
        pageTitle = '文章列表';
        this.titles.unshift('文章管理');
        this.breadcrumbData.list = [{
          label: '文章管理',
          url: 'post',
          tooltip: '文章管理'
        }, {
          label: pageTitle,
          url: 'post',
          tooltip: pageTitle
        }];
    }
    this.titles.unshift(pageTitle);
  }

  private refreshCheckedStatus() {
    this.allChecked = this.postList.every((item) => this.checkedMap[item.post.postId]) || false;
    this.indeterminate = this.postList.some((item) => this.checkedMap[item.post.postId]) && !this.allChecked || false;
  }

  private resetCheckedStatus() {
    this.allChecked = false;
    this.indeterminate = false;
    this.trashEnabled = false;
    this.checkedMap = {};
  }

  private refreshBtnStatus() {
    const checkedList = this.postList.filter((item) => this.checkedMap[item.post.postId]);
    if (checkedList.length > 0) {
      this.trashEnabled = checkedList.every(
        (item) => this.checkedMap[item.post.postId] && item.post.postStatus !== PostStatus.TRASH);
    } else {
      this.trashEnabled = false;
    }
  }
}
