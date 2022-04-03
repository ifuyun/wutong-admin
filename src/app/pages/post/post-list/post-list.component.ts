import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { uniq } from 'lodash';
import { NzImage, NzImageService } from 'ng-zorro-antd/image';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTableFilterList } from 'ng-zorro-antd/table/src/table.types';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { CommentFlag, PostStatus, PostType, TaxonomyStatus, TaxonomyType } from '../../../config/common.enum';
import {
  COMMENT_FLAG,
  POST_AUTHOR_LENGTH,
  POST_EXCERPT_LENGTH,
  POST_SOURCE_LENGTH,
  POST_STATUS,
  POST_TAG_LIMIT,
  POST_TAXONOMY_LIMIT,
  POST_TITLE_LENGTH,
  TREE_ROOT_NODE_KEY
} from '../../../config/constants';
import { Message } from '../../../config/message.enum';
import { ResponseCode } from '../../../config/response-code.enum';
import { ListComponent } from '../../../core/list.component';
import { OptionEntity } from '../../../interfaces/option.interface';
import { OptionsService } from '../../../services/options.service';
import { TaxonomyModel } from '../../taxonomy/taxonomy.interface';
import { TaxonomyService } from '../../taxonomy/taxonomy.service';
import { Post, PostArchiveDate, PostQueryParam, PostSaveParam } from '../post.interface';
import { PostService } from '../post.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.less']
})
export class PostListComponent extends ListComponent implements OnInit, OnDestroy {
  @Input() postType!: PostType;
  @ViewChild('confirmModalContent') confirmModalContent!: TemplateRef<any>;

  readonly maxTitleLength = POST_TITLE_LENGTH;
  readonly maxExcerptLength = POST_EXCERPT_LENGTH;
  readonly maxTaxonomyNumber = POST_TAXONOMY_LIMIT;
  readonly maxPostSourceLength = POST_SOURCE_LENGTH;
  readonly maxPostAuthorLength = POST_AUTHOR_LENGTH;
  readonly maxTagNumber = POST_TAG_LIMIT;

  postList: Post[] = [];
  page: number = 1;
  total: number = 0;
  pageSize = 10;
  loading = true;
  keyword: string = '';
  allChecked = false;
  indeterminate = false;
  checkedMap: Record<string, boolean> = {};
  checkedPosts: Post[] = [];
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
  activeCategory!: string;
  categoryFilterList: NzTreeNodeOptions[] = [{
    title: '全部',
    key: TREE_ROOT_NODE_KEY,
    children: []
  }];
  categoryFilterExpanded: string[] = [];
  postModalVisible = false;
  activePost!: Post;
  saveLoading = false;
  postFormRowGutter = 16;
  tagList: string[] = [];
  tagListLoading = false;
  tagSearchChange$ = new BehaviorSubject('');
  postCategoryList: NzTreeNodeOptions[] = [];
  disabledDate = (current: Date): boolean => current.getTime() > Date.now();
  passwordVisible = false;
  postForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(this.maxTitleLength)]],
    postDate: ['', [Validators.required]],
    category: ['', [
      (control: AbstractControl): ValidationErrors | null => {
        const checkedIds = control.value;
        let allIds: string[] = [];
        if (checkedIds) {
          allIds = this.taxonomyService.getAllChildren(this.postCategoryList, checkedIds);
        }
        return allIds.length > this.maxTaxonomyNumber ? { maxsize: true } : null;
      }
    ]],
    tag: [[]],
    status: ['', [Validators.required]],
    password: [''],
    commentFlag: ['', [Validators.required]],
    original: [1, [Validators.required]],
    source: [''],
    author: [''],
    copyrightType: [0, [Validators.required]],
    wechatCardFlag: [0, [Validators.required]],
    updateFlag: [0, [Validators.required]],
    excerpt: ['', [
      (control: AbstractControl): ValidationErrors | null => {
        const excerpt = control.value.trim();
        if (this.postType !== PostType.ATTACHMENT) {
          return null;
        }
        const result: ValidationErrors = {};
        if (!excerpt) {
          result['required'] = true;
        }
        if (excerpt.length > this.maxExcerptLength) {
          result['maxlength'] = true;
        }
        return result;
      }
    ]]
  }, {
    validators: [
      (control: AbstractControl): ValidationErrors | null => {
        const status = control.get('status')?.value;
        const category = control.get('category')?.value;
        const condition = (!category || category.length < 1) &&
          (![PostStatus.TRASH, PostStatus.DRAFT].includes(status)) &&
          this.postType === PostType.POST;

        return condition ? { category: { required: true } } : null;
      },
      (control: AbstractControl): ValidationErrors | null => {
        const original = control.get('original')?.value;
        const source = control.get('source')?.value.trim();
        const author = control.get('author')?.value.trim();
        const result: ValidationErrors = {};
        if (original !== 0 || source && author) {
          return null;
        }
        if (!source) {
          result['source'] = { required: true };
        }
        if (source.length > this.maxPostSourceLength) {
          result['source'].maxlength = true;
        }
        if (!author) {
          result['author'] = { required: true };
        }
        if (author.length > this.maxPostAuthorLength) {
          result['author'].maxlength = true;
        }
        return result;
      },
      (control: AbstractControl): ValidationErrors | null => {
        const status = control.get('status')?.value;
        const password = control.get('password')?.value.trim();
        return status === PostStatus.PASSWORD && !password ? { password: { required: true } } : null;
      }
    ]
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
  private initialized = false;
  private orders: string[][] = [];
  private lastParam: string = '';
  private options: OptionEntity = {};
  private optionsListener!: Subscription;
  private paramListener!: Subscription;
  private postsListener!: Subscription;
  private archiveListener!: Subscription;
  private taxonomyListener!: Subscription;
  private tagListener!: Subscription;

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
      this.category = queryParams.get('category')?.trim() || '';
      this.tag = queryParams.get('tag')?.trim() || '';
      this.year = queryParams.get('year')?.trim() || '';
      const month = parseInt(queryParams.get('month')?.trim() || '', 10);
      this.month = isNaN(month) ? '' : month < 10 ? '0' + month : month.toString();
      this.keyword = queryParams.get('keyword')?.trim() || '';
      this.statuses = <PostStatus[]>(queryParams.getAll('status') || []);
      this.commentFlags = <CommentFlag[]>(queryParams.getAll('commentFlag') || []);
      this.initialized = false;
      this.updatePageInfo();
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
    this.postsListener.unsubscribe();
    this.archiveListener.unsubscribe();
    this.taxonomyListener.unsubscribe();
    this.tagListener?.unsubscribe();
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
    this.activeCategory = '';
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

  editPost(post: Post) {
    this.activePost = post;
    this.postForm.setValue({
      title: post.post.postTitle,
      postDate: new Date(post.post.postDate),
      category: post.categories.map((item) => item.taxonomyId),
      tag: post.tags.map((item) => item.name),
      status: post.post.postStatus,
      password: post.post.postPassword || '',
      commentFlag: post.post.commentFlag,
      original: post.post.postOriginal,
      source: post.meta['post_source'] || '',
      author: post.meta['post_author'] || '',
      copyrightType: Number(post.meta['copyright_type']) || 0,
      wechatCardFlag: Number(post.meta['show_wechat_card']) || 0,
      updateFlag: 0,
      excerpt: post.post.postExcerpt
    });
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
    const { value, valid } = this.validateForm(this.postForm);
    if (!valid) {
      return;
    }
    if (this.activePost.post.postStatus !== PostStatus.TRASH && value.status === PostStatus.TRASH) {
      this.message.error('状态不允许为"删除"');
      return;
    }
    if (value.status === PostStatus.TRASH && (value.category.length > 0 || value.tag.length > 0)) {
      const errTypes: string[] = [];
      value.category.length > 0 && errTypes.push('分类');
      value.tag.length > 0 && errTypes.push('标签');
      this.message.error(`要添加${errTypes.join('和')}，请将状态设为非"删除"状态`);
      return;
    }
    this.saveLoading = true;
    const postData: PostSaveParam = {
      postId: this.activePost.post.postId,
      postTitle: value.title,
      postContent: this.activePost.post.postContent,
      postExcerpt: value.excerpt,
      postDate: value.postDate,
      postGuid: this.activePost.post.postGuid,
      postStatus: value.status,
      commentFlag: value.commentFlag,
      postAuthor: value.author,
      postOriginal: value.original,
      postPassword: value.password,
      postParent: this.activePost.post.postParent,
      postType: this.postType,
      postSource: value.source,
      postTaxonomies: value.category,
      postTags: value.tag,
      showWechatCard: value.wechatCardFlag,
      copyrightType: value.copyrightType,
      updateModified: value.updateFlag
    };
    this.postService.savePost(postData).subscribe((res) => {
      this.saveLoading = false;
      if (res.code === ResponseCode.SUCCESS) {
        this.message.success(Message.SUCCESS);
        this.fetchData(true);
        this.closePostModal();
      }
    });
  }

  deletePosts(postIds?: string[]) {
    const checkedIds: string[] = postIds || Object.keys(this.checkedMap).filter((item) => this.checkedMap[item]);
    if (checkedIds.length < 1) {
      this.message.error('请先选择至少一篇内容');
      return;
    }
    this.checkedPosts = this.postList.filter((item) => checkedIds.includes(item.post.postId));
    const confirmModal = this.modal.confirm({
      nzWidth: 480,
      nzTitle: '确定删除吗？',
      nzContent: this.confirmModalContent,
      nzOkDanger: true,
      nzOnOk: () => {
        this.postService.deletePosts(checkedIds).subscribe((res) => {
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

  protected updateBreadcrumb(): void {
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private fetchData(force = false) {
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
    if (latestParam === this.lastParam && !force) {
      return;
    }
    this.loading = true;
    this.resetCheckedStatus();
    this.lastParam = latestParam;
    this.postsListener = this.postService.getPosts(param).subscribe((res) => {
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
      status: [TaxonomyStatus.PUBLISH, TaxonomyStatus.PRIVATE],
      page: 1,
      pageSize: 0
    }).subscribe((res) => {
      this.taxonomies = res.taxonomies || [];
      this.categoryFilterList[0].children = this.taxonomyService.generateTaxonomyTree(this.taxonomies, true);
      this.postCategoryList = this.taxonomyService.generateTaxonomyTree(this.taxonomies);
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
    this.activeCategory = this.category;
    this.categoryFilterExpanded = [TREE_ROOT_NODE_KEY];
    if (this.activeCategory) {
      const curId = this.taxonomyService.getTaxonomyIdBySlug(this.taxonomies, this.activeCategory);
      const parents = this.taxonomyService.getParentTaxonomies(this.taxonomies, curId)
        .map((item) => item.slug);
      this.categoryFilterExpanded = this.categoryFilterExpanded.concat(parents);
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
    iterator(this.categoryFilterList);
  }

  private onCategoryFilterChange() {
    this.category = this.activeCategory;
    this.fetchData();
  }

  private initTagSearch() {
    const getTagList = (keyword: string): Observable<string[]> => this.taxonomyService.searchTags(keyword);
    const tagList$: Observable<string[]> = this.tagSearchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(switchMap(getTagList));
    this.tagListener = tagList$.subscribe((data) => {
      this.tagList = data;
      this.tagListLoading = false;
    });
  }

  private updatePageInfo() {
    this.titles = [this.options['site_name']];
    let pageTitle = '';
    switch (this.postType) {
      case PostType.PAGE:
        this.tableWidth = '1570px';
        this.titles.unshift('内容管理');
        pageTitle = '页面列表';
        this.breadcrumbData.list = [{
          label: '内容管理',
          url: 'post',
          tooltip: '内容管理'
        }, {
          label: pageTitle,
          url: 'post/standalone',
          tooltip: pageTitle
        }];
        break;
      case PostType.ATTACHMENT:
        this.tableWidth = '1000px';
        this.titles.unshift('素材管理');
        pageTitle = '素材列表';
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
        this.titles.unshift('内容管理');
        pageTitle = '文章列表';
        this.breadcrumbData.list = [{
          label: '内容管理',
          url: 'post',
          tooltip: '内容管理'
        }, {
          label: pageTitle,
          url: 'post',
          tooltip: pageTitle
        }];
    }
    this.titles.unshift(pageTitle);
    this.updateTitle();
    this.updateBreadcrumb();
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
