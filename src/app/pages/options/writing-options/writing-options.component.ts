import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { TaxonomyStatus, TaxonomyType } from '../../../config/common.enum';
import { POST_FORMAT_LIST } from '../../../config/constants';
import { Message } from '../../../config/message.enum';
import { ResponseCode } from '../../../config/response-code.enum';
import { BaseComponent } from '../../../core/base.component';
import { OptionEntity } from '../../../interfaces/option.interface';
import { TaxonomyModel } from '../../taxonomies/taxonomy.interface';
import { TaxonomyService } from '../../taxonomies/taxonomy.service';
import { OptionService } from '../option.service';

@Component({
  selector: 'app-writing-options',
  templateUrl: './writing-options.component.html',
  styleUrls: ['../option.less']
})
export class WritingOptionsComponent extends BaseComponent implements OnInit, OnDestroy {
  saveLoading = false;
  taxonomyTree: NzTreeNodeOptions[] = [];
  postFormats = POST_FORMAT_LIST;
  optionsForm: FormGroup = this.fb.group({
    defaultCategory: ['', [Validators.required]],
    defaultPostFormat: ['', [Validators.required]]
  });

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: true,
    list: []
  };

  private taxonomies!: TaxonomyModel[];
  private options: OptionEntity = {};
  private optionsListener!: Subscription;
  private taxonomiesListener!: Subscription;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionService: OptionService,
    private taxonomyService: TaxonomyService,
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
    this.fetchTaxonomies();
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
      defaultCategory: value.defaultCategory,
      defaultPostFormat: value.defaultPostFormat,
    };
    this.optionService.saveWritingOptions(formData).subscribe((res) => {
      this.saveLoading = false;
      if (res.code === ResponseCode.SUCCESS) {
        this.message.success(Message.SUCCESS);
      }
    });
  }

  protected updateBreadcrumb(breadcrumbData?: BreadcrumbData): void {
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private fetchTaxonomies(force = false) {
    if (this.taxonomies && !force) {
      return;
    }
    this.taxonomiesListener = this.taxonomyService.getTaxonomies({
      type: TaxonomyType.POST,
      status: [TaxonomyStatus.PUBLISH, TaxonomyStatus.PRIVATE],
      pageSize: 0
    }).subscribe((res) => {
      this.taxonomies = res.taxonomies || [];
      this.taxonomyTree = this.taxonomyService.generateTaxonomyTree(this.taxonomies);
    });
  }

  private initForm() {
    this.optionsForm.setValue({
      defaultCategory: this.options['default_post_category'],
      defaultPostFormat: this.options['default_post_format']
    });
  }

  private updatePageInfo() {
    this.titles = ['撰写设置', '网站设置', this.options['site_name']];
    this.breadcrumbData.list = [{
      label: '网站设置',
      url: '/options',
      tooltip: '网站设置'
    }, {
      label: '撰写设置',
      url: '/options/writing',
      tooltip: '撰写设置'
    }];
    this.updateTitle();
    this.updateBreadcrumb();
  }
}
