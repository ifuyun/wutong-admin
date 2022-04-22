import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import {
  SITE_ADMIN_EMAIL_LENGTH,
  SITE_COPYRIGHT_LENGTH,
  SITE_DESCRIPTION_LENGTH,
  SITE_ICP_NUM_LENGTH,
  SITE_KEYWORDS_LENGTH,
  SITE_KEYWORDS_SIZE,
  SITE_SLOGAN_LENGTH,
  SITE_TITLE_LENGTH,
  SITE_URL_LENGTH
} from '../../../config/constants';
import { Message } from '../../../config/message.enum';
import { ResponseCode } from '../../../config/response-code.enum';
import { PageComponent } from '../../../core/page.component';
import { OptionEntity } from '../option.interface';
import { OptionService } from '../option.service';

@Component({
  selector: 'app-general-options',
  templateUrl: './general-options.component.html',
  styleUrls: ['../option.less']
})
export class GeneralOptionsComponent extends PageComponent implements OnInit, OnDestroy {
  readonly maxTitleLength = SITE_TITLE_LENGTH;
  readonly maxDescLength = SITE_DESCRIPTION_LENGTH;
  readonly maxKeywordsLength = SITE_KEYWORDS_LENGTH;
  readonly maxKeywordsSize = SITE_KEYWORDS_SIZE;
  readonly maxSloganLength = SITE_SLOGAN_LENGTH;
  readonly maxUrlLength = SITE_URL_LENGTH;
  readonly maxIcpNumLength = SITE_ICP_NUM_LENGTH;
  readonly maxCopyrightLength = SITE_COPYRIGHT_LENGTH;
  readonly maxAdminEmailLength = SITE_ADMIN_EMAIL_LENGTH;

  saveLoading = false;
  optionsForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(this.maxTitleLength)]],
    description: ['', [Validators.required, Validators.maxLength(this.maxDescLength)]],
    keywords: [[], [
      Validators.required,
      (control: AbstractControl): ValidationErrors | null =>
        control.value.length > this.maxKeywordsSize ? { maxsize: true } : null
    ]],
    slogan: ['', [Validators.required, Validators.maxLength(this.maxSloganLength)]],
    url: ['', [Validators.required, Validators.maxLength(this.maxUrlLength)]],
    copyright: ['', [Validators.required, Validators.maxLength(this.maxCopyrightLength)]],
    icpCode: ['', [Validators.required, Validators.maxLength(this.maxIcpNumLength)]],
    adminEmail: ['', [Validators.required, Validators.email, Validators.maxLength(this.maxAdminEmailLength)]]
  });

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: true,
    list: []
  };

  private options: OptionEntity = {};
  private optionsListener!: Subscription;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionService: OptionService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    super();
  }

  ngOnInit(): void {
    this.optionsListener = this.optionService.options$.subscribe((options) => {
      this.options = options;
      this.initForm();
    });
    this.updatePageInfo();
  }

  ngOnDestroy(): void {
    this.optionsListener.unsubscribe();
  }

  saveOptions() {
    const { value, valid } = this.validateForm(this.optionsForm);
    if (!valid) {
      return;
    }
    const keywords = value.keywords.join(',');
    if (keywords.length > this.maxKeywordsLength) {
      this.message.error(`关键词长度最大为${this.maxKeywordsLength}字符，当前为${keywords.length}字符`);
      return;
    }
    this.saveLoading = true;
    const formData = {
      siteTitle: value.title,
      siteDescription: value.description,
      siteKeywords: value.keywords,
      siteSlogan: value.slogan,
      siteUrl: value.url,
      copyNotice: value.copyright,
      icpCode: value.icpCode,
      adminEmail: value.adminEmail
    };
    this.optionService.saveGeneralOptions(formData).subscribe((res) => {
      this.saveLoading = false;
      if (res.code === ResponseCode.SUCCESS) {
        this.message.success(Message.SUCCESS);
      }
    });
  }

  protected updateBreadcrumb(breadcrumbData?: BreadcrumbData): void {
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private initForm() {
    this.optionsForm.setValue({
      title: this.options['site_name'],
      description: this.options['site_description'],
      keywords: this.options['site_keywords'].split(','),
      slogan: this.options['site_slogan'],
      url: this.options['site_url'],
      copyright: this.options['copyright_notice'],
      icpCode: this.options['icp_code'],
      adminEmail: this.options['admin_email']
    });
  }

  private updatePageInfo() {
    this.titles = ['常规设置', '网站设置', this.options['site_name']];
    this.breadcrumbData.list = [{
      label: '网站设置',
      url: '/options',
      tooltip: '网站设置'
    }, {
      label: '常规设置',
      url: '/options/general',
      tooltip: '常规设置'
    }];
    this.updateTitle();
    this.updateBreadcrumb();
  }
}
