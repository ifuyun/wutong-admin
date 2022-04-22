import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import {
  STATIC_RESOURCE_HOST_LENGTH,
  UPLOAD_PATH_LENGTH,
  UPLOAD_URL_PREFIX_LENGTH,
  WATERMARK_FONT_PATH_LENGTH
} from '../../../config/constants';
import { Message } from '../../../config/message.enum';
import { ResponseCode } from '../../../config/response-code.enum';
import { PageComponent } from '../../../core/page.component';
import { OptionEntity } from '../option.interface';
import { OptionService } from '../option.service';

@Component({
  selector: 'app-media-options',
  templateUrl: './media-options.component.html',
  styleUrls: ['../option.less']
})
export class MediaOptionsComponent extends PageComponent implements OnInit, OnDestroy {
  readonly maxUploadPathLength = UPLOAD_PATH_LENGTH;
  readonly maxStaticResourceHostLength = STATIC_RESOURCE_HOST_LENGTH;
  readonly maxUploadUrlPrefixLength = UPLOAD_URL_PREFIX_LENGTH;
  readonly maxWatermarkFontPathLength = WATERMARK_FONT_PATH_LENGTH;
  readonly maxFileLimit = 20;
  readonly maxFileSize = 8 * 1024;

  saveLoading = false;
  optionsForm: FormGroup = this.fb.group({
    uploadFileLimit: ['', [
      Validators.required,
      Validators.min(1),
      Validators.max(this.maxFileLimit)
    ]],
    uploadFileSize: ['', [
      Validators.required,
      Validators.min(1),
      Validators.max(this.maxFileSize)
    ]],
    uploadPath: ['', [
      Validators.required,
      Validators.maxLength(this.maxUploadPathLength),
      Validators.pattern(/^(?:\/|(?:\/[a-zA-Z0-9\-_. ]+)*)$/i)
    ]],
    staticResourceHost: ['', [
      Validators.required,
      Validators.maxLength(this.maxStaticResourceHostLength),
      Validators.pattern(
        /^https?:\/\/[a-zA-Z0-9]+(?:[\-_][a-zA-Z0-9]+)*(?:\.[a-zA-Z0-9]+(?:[\-_][a-zA-Z0-9]+)*)*(?::\d{1,5})?$/i
      )
    ]],
    uploadUrlPrefix: ['', [
      Validators.required,
      Validators.maxLength(this.maxUploadUrlPrefixLength),
      Validators.pattern(/^(?:\/[a-zA-Z0-9\-+_.,~%]+)+$/i)
    ]],
    watermarkFontPath: ['', [
      Validators.required,
      Validators.maxLength(this.maxWatermarkFontPathLength),
      Validators.pattern(/^(?:\/|((?:\/[a-zA-Z0-9\-_. ]+)*(?:\.[a-zA-Z0-9]+)?))$/i)
    ]]
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
      uploadFileLimit: Number(value.uploadFileLimit),
      uploadFileSize: Number(value.uploadFileSize),
      uploadPath: value.uploadPath,
      staticResourceHost: value.staticResourceHost,
      uploadUrlPrefix: value.uploadUrlPrefix,
      watermarkFontPath: value.watermarkFontPath
    };
    this.optionService.saveMediaOptions(formData).subscribe((res) => {
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
      uploadFileLimit: this.options['upload_max_file_limit'],
      uploadFileSize: this.options['upload_max_file_size'],
      uploadPath: this.options['upload_path'],
      staticResourceHost: this.options['static_resource_host'],
      uploadUrlPrefix: this.options['upload_url_prefix'],
      watermarkFontPath: this.options['watermark_font_path']
    });
  }

  private updatePageInfo() {
    this.titles = ['媒体设置', '网站设置', this.options['site_name']];
    this.breadcrumbData.list = [{
      label: '网站设置',
      url: '/options',
      tooltip: '网站设置'
    }, {
      label: '媒体设置',
      url: '/options/media',
      tooltip: '媒体设置'
    }];
    this.updateTitle();
    this.updateBreadcrumb();
  }
}
