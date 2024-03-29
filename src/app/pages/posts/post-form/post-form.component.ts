import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import {
  CommentFlag,
  PostOriginal,
  PostStatus,
  PostType,
  TaxonomyStatus,
  TaxonomyType
} from '../../../config/common.enum';
import {
  POST_AUTHOR_LENGTH,
  POST_EXCERPT_LENGTH,
  POST_NAME_LENGTH,
  POST_PASSWORD_LENGTH,
  POST_SOURCE_LENGTH,
  POST_TAG_SIZE,
  POST_TAXONOMY_SIZE,
  POST_TITLE_LENGTH
} from '../../../config/constants';
import { Message } from '../../../config/message.enum';
import { ResponseCode } from '../../../config/response-code.enum';
import { PageComponent } from '../../../core/page.component';
import { UrlInfo } from '../../../core/url.interface';
import { UrlService } from '../../../core/url.service';
import { OptionEntity } from '../../options/option.interface';
import { OptionService } from '../../options/option.service';
import { TaxonomyModel } from '../../taxonomies/taxonomy.interface';
import { TaxonomyService } from '../../taxonomies/taxonomy.service';
import { Post, PostSaveParam } from '../post.interface';
import { PostService } from '../post.service';

declare type ToolbarMode = 'floating' | 'sliding' | 'scrolling' | 'wrap';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.less']
})
export class PostFormComponent extends PageComponent implements OnInit, OnDestroy {
  @Input() postType!: PostType;

  readonly maxTitleLength = POST_TITLE_LENGTH;
  readonly maxNameLength = POST_NAME_LENGTH;
  readonly maxExcerptLength = POST_EXCERPT_LENGTH;
  readonly maxTaxonomySize = POST_TAXONOMY_SIZE;
  readonly maxPostPasswordLength = POST_PASSWORD_LENGTH;
  readonly maxPostSourceLength = POST_SOURCE_LENGTH;
  readonly maxPostAuthorLength = POST_AUTHOR_LENGTH;
  readonly maxTagSize = POST_TAG_SIZE;

  postId = '';
  activePost!: Post;
  saveLoading = false;
  tagList: string[] = [];
  tagListLoading = false;
  tagSearchChange$ = new BehaviorSubject('');
  postCategoryList: NzTreeNodeOptions[] = [];
  disabledDate = (current: Date): boolean => current.getTime() > Date.now();
  passwordVisible = false;
  postForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(this.maxTitleLength)]],
    content: ['', [Validators.required]],
    postDate: ['', [Validators.required]],
    category: ['', [
      (control: AbstractControl): ValidationErrors | null =>
        (!control.value || control.value.length < 1) && this.postType === PostType.POST ? { required: true } : null,
      (control: AbstractControl): ValidationErrors | null =>
        control.value.length > this.maxTaxonomySize ? { maxsize: true } : null
    ]],
    tag: [[], [
      (control: AbstractControl): ValidationErrors | null =>
        control.value.length > this.maxTagSize ? { maxsize: true } : null
    ]],
    name: ['', [
      (control: AbstractControl): ValidationErrors | null =>
        !control.value.trim() && this.postType === PostType.PAGE ? { required: true } : null,
      Validators.maxLength(this.maxNameLength),
      Validators.pattern(/^[a-zA-Z0-9]+(?:[~@$%&*\-_=+;:,]+[a-zA-Z0-9]+)*$/i)
    ]],
    status: ['', [Validators.required]],
    password: [''],
    commentFlag: ['', [Validators.required]],
    original: [1, [Validators.required]],
    source: [''],
    author: [''],
    copyrightType: [0, [Validators.required]],
    wechatCardFlag: [0, [Validators.required]],
    updateFlag: [0, [
      (control: AbstractControl): ValidationErrors | null =>
        this.postId && ![0, 1].includes(control.value) ? { required: true } : null
    ]],
    excerpt: ['', [Validators.maxLength(this.maxExcerptLength)]]
  }, {
    validators: [
      (control: AbstractControl): ValidationErrors | null => {
        const original = control.get('original')?.value;
        const source = control.get('source')?.value.trim();
        const author = control.get('author')?.value.trim();
        if (
          original !== 0
          || source && source.length <= this.maxPostSourceLength
          && author && author.length <= this.maxPostAuthorLength
        ) {
          return null;
        }
        const result: ValidationErrors = { source: {}, author: {} };
        if (!source) {
          result['source'].required = true;
        }
        if (source.length > this.maxPostSourceLength) {
          result['source'].maxlength = true;
        }
        if (!author) {
          result['author'].required = true;
        }
        if (author.length > this.maxPostAuthorLength) {
          result['author'].maxlength = true;
        }
        return result;
      },
      (control: AbstractControl): ValidationErrors | null => {
        const status = control.get('status')?.value;
        const password = control.get('password')?.value.trim();
        if (status !== PostStatus.PASSWORD || password && password.length <= this.maxPostPasswordLength) {
          return null;
        }
        const result: ValidationErrors = { password: {} };
        if (!password) {
          result['password'].required = true;
        }
        if (password.length > this.maxPostPasswordLength) {
          result['password'].maxlength = true;
        }
        return result;
      }
    ]
  });
  editorOptions!: Record<string, any>;

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: true,
    list: []
  };

  private referer!: UrlInfo;
  private editorPath = '/admin/assets/editor';
  private userDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  private editorTheme = this.userDarkMode ? 'dark' : 'default';
  private taxonomies!: TaxonomyModel[];
  private options: OptionEntity = {};
  private optionsListener!: Subscription;
  private paramListener!: Subscription;
  private postListener!: Subscription;
  private taxonomyListener!: Subscription;
  private tagListener!: Subscription;
  private urlListener!: Subscription;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionService: OptionService,
    private postService: PostService,
    private taxonomyService: TaxonomyService,
    private urlService: UrlService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    super();
  }

  ngOnInit(): void {
    this.urlListener = this.urlService.urlHistory$.subscribe((url) => {
      this.referer = this.urlService.parseUrl(url.previous);
    });
    this.optionsListener = this.optionService.options$.subscribe((options) => {
      this.options = options;
    });
    this.paramListener = this.route.queryParamMap.subscribe((queryParams) => {
      this.postId = queryParams.get('postId')?.trim() || '';
      this.fetchPost();
      this.fetchCategories();
    });
    this.initEditor();
    this.initTagSearch();
  }

  ngOnDestroy() {
    this.optionsListener.unsubscribe();
    this.paramListener.unsubscribe();
    this.postListener?.unsubscribe();
    this.taxonomyListener.unsubscribe();
    this.tagListener.unsubscribe();
    this.urlListener.unsubscribe();
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
      this.message.error('可见性不允许为"删除"');
      return;
    }
    this.saveLoading = true;
    const postData: PostSaveParam = {
      postId: this.activePost.post.postId,
      postTitle: value.title,
      postContent: value.content,
      postExcerpt: value.excerpt,
      postDate: value.postDate,
      postName: value.name,
      postStatus: value.status,
      commentFlag: value.commentFlag,
      postAuthor: value.author,
      postOriginal: value.original,
      postPassword: value.status === PostStatus.PASSWORD ? value.password : '',
      postParent: '',
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
        if (this.referer && this.referer.path) {
          this.router.navigate([this.referer.path], { queryParams: this.referer.params });
        } else {
          this.router.navigate([this.postType === PostType.POST ? '/posts/articles' : '/posts/pages']);
        }
      }
    });
  }

  protected updateBreadcrumb(): void {
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private fetchPost() {
    if (!this.postId) {
      this.activePost = {
        post: {
          postType: this.postType,
          postId: '',
          postTitle: '',
          postContent: '',
          postExcerpt: '',
          postDate: new Date(),
          postName: '',
          postGuid: '',
          postStatus: PostStatus.PUBLISH,
          postOriginal: PostOriginal.YES,
          commentFlag: CommentFlag.VERIFY
        },
        meta: {
          copyright_type: '1',
          show_wechat_card: '1'
        },
        categories: [],
        tags: []
      };
      this.updatePageInfo();
      this.initForm();
      return;
    }
    this.postListener = this.postService.getPostById(this.postId).subscribe((post) => {
      this.activePost = post;
      this.activePost.post.postDate = new Date(this.activePost.post.postDate);
      this.updatePageInfo();
      this.initForm();
    });
  }

  private fetchCategories() {
    if (this.taxonomies) {
      return;
    }
    this.taxonomyListener = this.taxonomyService.getTaxonomies({
      type: TaxonomyType.POST,
      status: [TaxonomyStatus.PUBLISH, TaxonomyStatus.PRIVATE],
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
      tag: this.activePost.tags.map((item) => item.taxonomyName),
      name: this.activePost.post.postName,
      status: this.activePost.post.postStatus,
      password: this.activePost.post.postPassword || '',
      commentFlag: this.activePost.post.commentFlag,
      original: this.activePost.post.postOriginal,
      source: this.activePost.meta['post_source'] || '',
      author: this.activePost.meta['post_author'] || '',
      copyrightType: Number(this.activePost.meta['copyright_type']) || 0,
      wechatCardFlag: Number(this.activePost.meta['show_wechat_card']) || 0,
      updateFlag: 0
    });
  }

  private initEditor() {
    this.editorOptions = {
      height: 600,
      skin_url: `${this.editorPath}/ui/${this.editorTheme}`,
      content_css: `${this.editorPath}/content/${this.editorTheme}/content.min.css`,
      content_style: 'body { font-size: 14px; }',
      fontsize_formats: '12px 13px 14px 16px 18px 24px 32px 36px',
      language: 'zh_CN',
      language_url: `${this.editorPath}/langs/zh_CN.js`,
      image_advtab: true,
      image_caption: true,
      menubar: false,
      // todo: image
      contextmenu: 'link lists table image imagetools',
      codesample_languages: [
        {text: 'TypeScript', value: 'typescript'},
        {text: 'JavaScript', value: 'javascript'},
        {text: 'HTML/XML', value: 'xml'},
        {text: 'LESS', value: 'less'},
        {text: 'CSS', value: 'css'},
        {text: 'SCSS', value: 'scss'},
        {text: 'JSON', value: 'json'},
        {text: 'Bash', value: 'bash'},
        {text: 'Java', value: 'java'},
        {text: 'PHP', value: 'php'},
        {text: 'Python', value: 'python'},
        {text: 'Ruby', value: 'ruby'},
        {text: 'SQL', value: 'sql'},
        {text: 'Nginx', value: 'nginx'},
        {text: 'ini', value: 'ini'}
      ],
      toolbar_sticky: true,
      toolbar_mode: <ToolbarMode>'sliding',
      toolbar: 'undo redo | fontsizeselect formatselect | forecolor backcolor removeformat | ' +
        'codesample blockquote code pastetext | fullscreen preview print | fontselect | ' +
        'bold italic underline strikethrough | numlist bullist | alignleft aligncenter alignright alignjustify | ' +
        'outdent indent | superscript subscript charmap | hr pagebreak | link anchor template image media',
      quickbars_selection_toolbar: 'bold italic underline | forecolor backcolor | ' +
        'h2 h3 codesample blockquote quicklink | superscript subscript',
      plugins: 'preview print paste searchreplace autolink directionality code visualblocks visualchars ' +
        'fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor ' +
        'insertdatetime advlist lists wordcount help charmap quickbars'
    };
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
        pageTitle = this.postId ? '编辑页面' : '新建页面';
        this.breadcrumbData.list = [{
          label: '内容管理',
          url: '/posts/articles',
          tooltip: '内容管理'
        }, {
          label: pageTitle,
          url: '',
          tooltip: pageTitle
        }];
        break;
      default:
        this.titles.unshift('内容管理');
        pageTitle = this.postId ? '编辑文章' : '写文章';
        this.breadcrumbData.list = [{
          label: '内容管理',
          url: '/posts/articles',
          tooltip: '内容管理'
        }, {
          label: pageTitle,
          url: '',
          tooltip: pageTitle
        }];
    }
    this.titles.unshift(pageTitle);
    if (this.postId) {
      const postTitle = this.activePost.post.postTitle;
      this.titles.unshift(postTitle);
      this.breadcrumbData.list.push({
        label: postTitle,
        url: '',
        tooltip: postTitle
      });
    }
    this.updateTitle();
    this.updateBreadcrumb();
  }
}
