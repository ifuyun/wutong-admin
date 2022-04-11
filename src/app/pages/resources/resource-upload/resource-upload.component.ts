import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { differenceWith, isEqual } from 'lodash';
import { NzImage, NzImageService } from 'ng-zorro-antd/image';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadFile, UploadFilter } from 'ng-zorro-antd/upload/interface';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { ApiUrl } from '../../../config/api-url';
import { BaseComponent } from '../../../core/base.component';
import { OptionEntity } from '../../../interfaces/option.interface';
import { OptionService } from '../../options/option.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-resource-upload',
  templateUrl: './resource-upload.component.html',
  styleUrls: ['./resource-upload.component.less']
})
export class ResourceUploadComponent extends BaseComponent implements OnInit, OnDestroy {
  fileList: NzUploadFile[] = [];
  uploading = false;
  fileSizeWithMB = 4;
  fileSizeWithKB = this.fileSizeWithMB * 1024;
  fileSizeWithByte = this.fileSizeWithMB * 1024 * 1024;
  fileLimit = 10;
  uploadAction = ApiUrl.UPLOAD_FILES;
  filters: UploadFilter[] = [{
    name: 'fileSize',
    fn: (fileList: NzUploadFile[]) => {
      const filterFiles = fileList.filter((file) => file.size && file.size > this.fileSizeWithByte);
      const fileNames = filterFiles.map((item) => item.name);
      if (filterFiles.length > 0) {
        this.message.error(
          `以下文件大小超出限制（最大限制为 ${this.fileSizeWithMB} MB）：${fileNames.join(', ')}`
        );
        return differenceWith(fileList, filterFiles, isEqual);
      }
      return fileList;
    }
  }, {
    name: 'fileLimit',
    fn: (fileList: NzUploadFile[]) => {
      if (this.fileList.length + fileList.length > this.fileLimit) {
        this.message.error('文件数量超出限制，请重新选择');
        return [];
      }
      return fileList;
    }
  }];
  uploadForm: FormGroup = this.fb.group({
    watermark: [false],
    original: [true]
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
    private message: NzMessageService,
    private imageService: NzImageService
  ) {
    super();
  }

  ngOnInit(): void {
    this.optionsListener = this.optionService.options$.subscribe((options) => {
      this.options = options;
    });
    this.updatePageInfo();
  }

  ngOnDestroy(): void {
    this.optionsListener.unsubscribe();
  }

  onChange(info: NzUploadChangeParam) {
  }

  onPreview = async (file: NzUploadFile): Promise<void> => {
    if (!file.url && !file['preview']) {
      file['preview'] = await this.getBase64(file as any);
    }
    const images: NzImage[] = [{
      src: file.url || file['preview']
    }];
    this.imageService.preview(images);
  };

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };

  upload() {

  }

  protected updateBreadcrumb(breadcrumbData?: BreadcrumbData): void {
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private updatePageInfo() {
    this.titles = ['文件上传', '素材管理', this.options['site_name']];
    this.breadcrumbData.list = [{
      label: '素材管理',
      url: '/resources',
      tooltip: '素材管理'
    }, {
      label: '文件上传',
      url: '/resources/upload',
      tooltip: '文件上传'
    }];
    this.updateTitle();
    this.updateBreadcrumb();
  }

  private getBase64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
}
