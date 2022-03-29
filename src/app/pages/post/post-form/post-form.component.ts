import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { CommentFlag, PostOriginal, PostStatus, PostType, TaxonomyStatus, TaxonomyType } from '../../../config/common.enum';
import { POST_EXCERPT_LENGTH, POST_TAG_LIMIT, POST_TAXONOMY_LIMIT } from '../../../config/constants';
import { BaseComponent } from '../../../core/base.component';
import { OptionEntity } from '../../../interfaces/option.interface';
import { OptionsService } from '../../../services/options.service';
import { TaxonomyModel } from '../../taxonomy/taxonomy.interface';
import { TaxonomyService } from '../../taxonomy/taxonomy.service';
import { Post } from '../post.interface';
import { PostService } from '../post.service';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.less']
})
export class PostFormComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() postType!: PostType;

  activePost!: Post;
  maxExcerptLength = POST_EXCERPT_LENGTH;
  maxTaxonomyNumber = POST_TAXONOMY_LIMIT;
  maxTagNumber = POST_TAG_LIMIT;
  tagList: string[] = [];
  tagListLoading = false;
  tagSearchChange$ = new BehaviorSubject('');
  postCategoryList: NzTreeNodeOptions[] = [];
  disabledDate = (current: Date): boolean => current.getTime() > Date.now();
  postForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    content: ['', [Validators.required]],
    postDate: ['', [Validators.required]],
    category: ['', [
      Validators.required,
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
    guid: [''],
    status: ['', [Validators.required]],
    password: [''],
    commentFlag: ['', [Validators.required]],
    original: [1, [Validators.required]],
    source: [''],
    author: [''],
    copyrightType: [0, [Validators.required]],
    wechatCardFlag: [0, [Validators.required]],
    updateFlag: [0, [Validators.required]],
    excerpt: ['', [Validators.required, Validators.maxLength(this.maxExcerptLength)]]
  }, {
    validators: [
      (control: AbstractControl): ValidationErrors | null => {
        const original = control.get('original')?.value;
        const source = control.get('source')?.value.trim();
        const author = control.get('author')?.value.trim();
        const result: ValidationErrors = {};
        if (original !== 0 || source && author) {
          return null;
        }
        if (!source) {
          result['source'] = true;
        }
        if (!author) {
          result['author'] = true;
        }
        return result;
      },
      (control: AbstractControl): ValidationErrors | null => {
        const status = control.get('status')?.value;
        const password = control.get('password')?.value.trim();
        return status === PostStatus.PASSWORD && !password ? { password: true } : null;
      }
    ]
  });

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: true,
    list: []
  };

  private postId = '';
  private taxonomies!: TaxonomyModel[];
  private options: OptionEntity = {};
  private optionsListener!: Subscription;
  private paramListener!: Subscription;
  private postListener!: Subscription;
  private taxonomyListener!: Subscription;
  private tagListener!: Subscription;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionsService: OptionsService,
    private postService: PostService,
    private taxonomyService: TaxonomyService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    super();
  }

  ngOnInit(): void {
    this.optionsListener = this.optionsService.options$.subscribe((options) => {
      this.options = options;
    });
    this.paramListener = this.route.queryParamMap.subscribe((queryParams) => {
      this.postId = queryParams.get('postId')?.trim() || '';
      this.updatePageInfo();
      this.fetchPost();
      this.fetchCategories();
    });
    this.initTagSearch();
  }

  ngOnDestroy() {
    this.optionsListener.unsubscribe();
    this.paramListener.unsubscribe();
    this.postListener.unsubscribe();
    this.taxonomyListener.unsubscribe();
    this.tagListener.unsubscribe();
  }

  onTagSearch(keyword: string) {
    if (!keyword.trim()) {
      this.tagList = [];
      return;
    }
    this.tagListLoading = true;
    this.tagSearchChange$.next(keyword);
  }

  protected updateBreadcrumb(): void {
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private fetchPost() {
    if (!this.postId) {
      this.activePost = {
        post: {
          postId: '',
          postTitle: '',
          postContent: '',
          postExcerpt: '',
          postDate: new Date(),
          postGuid: '',
          postStatus: PostStatus.PUBLISH,
          postOriginal: PostOriginal.YES,
          commentFlag: CommentFlag.VERIFY
        },
        meta: {
          copyright_type: '1',
          show_wechat_card: '1',
        },
        categories: [],
        tags: []
      };
      this.initForm();
      return;
    }
    this.postListener = this.postService.getPostById(this.postId).subscribe((post) => {
      this.activePost = post;
      this.activePost.post.postDate = new Date(this.activePost.post.postDate);
      this.initForm();
    });
  }

  private fetchCategories() {
    if (this.taxonomies) {
      return;
    }
    this.taxonomyListener = this.taxonomyService.getTaxonomies({
      type: TaxonomyType.POST,
      status: [TaxonomyStatus.OPEN, TaxonomyStatus.CLOSED],
      page: 1,
      pageSize: 0
    }).subscribe((res) => {
      this.taxonomies = res.taxonomies || [];
      this.postCategoryList = this.taxonomyService.generateTaxonomyTree(this.taxonomies);
    });
  }

  private initForm() {
    this.postForm.setValue({
      title: this.activePost.post.postTitle,
      content: this.activePost.post.postContent,
      excerpt: this.activePost.post.postExcerpt,
      postDate: this.activePost.post.postDate,
      category: this.activePost.categories.map((item) => item.taxonomyId),
      tag: this.activePost.tags.map((item) => item.name),
      guid: this.activePost.post.postGuid,
      status: this.activePost.post.postStatus,
      password: this.activePost.post.postPassword || '',
      commentFlag: this.activePost.post.commentFlag,
      original: this.activePost.post.postOriginal,
      source: this.activePost.meta['post_source'] || '',
      author: this.activePost.meta['post_author'] || '',
      copyrightType: Number(this.activePost.meta['copyright_type']) || 0,
      wechatCardFlag: Number(this.activePost.meta['show_wechat_card']) || 0,
      updateFlag: 0,
    });
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
        this.titles.unshift('内容管理');
        pageTitle = this.postId ? '页面编辑' : '创建新页面';
        this.breadcrumbData.list = [{
          label: '内容管理',
          url: '/post',
          tooltip: '内容管理'
        }, {
          label: pageTitle,
          url: '',
          tooltip: pageTitle
        }];
        break;
      default:
        this.titles.unshift('内容管理');
        pageTitle = this.postId ? '文章编辑' : '写文章';
        this.breadcrumbData.list = [{
          label: '内容管理',
          url: '/post',
          tooltip: '内容管理'
        }, {
          label: pageTitle,
          url: '',
          tooltip: pageTitle
        }];
    }
    this.titles.unshift(pageTitle);
    this.updateTitle();
    this.updateBreadcrumb();
  }
}
