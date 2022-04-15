import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { Message } from '../../../config/message.enum';
import { ResponseCode } from '../../../config/response-code.enum';
import { PageComponent } from '../../../core/page.component';
import { OptionEntity } from '../../../interfaces/option.interface';
import { OptionService } from '../option.service';

@Component({
  selector: 'app-reading-options',
  templateUrl: './reading-options.component.html',
  styleUrls: ['../option.less']
})
export class ReadingOptionsComponent extends PageComponent implements OnInit, OnDestroy {
  saveLoading = false;
  optionsForm: FormGroup = this.fb.group({
    postsPerPage: ['', [Validators.required]],
    postsPerRss: ['', [Validators.required]],
    rssUseExcerpt: ['', [Validators.required]]
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
    this.saveLoading = true;
    const formData = {
      postsPerPage: Number(value.postsPerPage),
      postsPerRss: Number(value.postsPerRss),
      rssUseExcerpt: Number(value.rssUseExcerpt)
    };
    this.optionService.saveReadingOptions(formData).subscribe((res) => {
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
      postsPerPage: this.options['posts_per_page'],
      postsPerRss: this.options['posts_per_rss'],
      rssUseExcerpt: this.options['rss_use_excerpt']
    });
  }

  private updatePageInfo() {
    this.titles = ['阅读设置', '网站设置', this.options['site_name']];
    this.breadcrumbData.list = [{
      label: '网站设置',
      url: '/options',
      tooltip: '网站设置'
    }, {
      label: '阅读设置',
      url: '/options/reading',
      tooltip: '阅读设置'
    }];
    this.updateTitle();
    this.updateBreadcrumb();
  }
}
