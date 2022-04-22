import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { differenceWith, isEqual } from 'lodash';
import { NzImage, NzImageService } from 'ng-zorro-antd/image';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, UploadFilter } from 'ng-zorro-antd/upload/interface';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { ApiUrl } from '../../../config/api-url';
import { Message } from '../../../config/message.enum';
import { ResponseCode } from '../../../config/response-code.enum';
import { PageComponent } from '../../../core/page.component';
import { OptionEntity } from '../../options/option.interface';
import { OptionService } from '../../options/option.service';
import { PostService } from '../../posts/post.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-resource-upload',
  templateUrl: './resource-upload.component.html',
  styleUrls: ['./resource-upload.component.less']
})
export class ResourceUploadComponent extends PageComponent implements OnInit, OnDestroy {
  fileList: NzUploadFile[] = [];
  uploading = false;
  fileLimit!: number;
  fileSizeWithMB!: number;
  fileSizeWithKB!: number;
  fileSizeWithByte!: number;
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

  private imageTypes: string[] = ['image/jpeg', 'image/png', 'image/gif'];
  private options: OptionEntity = {};
  private optionsListener!: Subscription;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionService: OptionService,
    private postService: PostService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private imageService: NzImageService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    super();
  }

  ngOnInit(): void {
    this.optionsListener = this.optionService.options$.subscribe((options) => {
      this.options = options;
      this.fileLimit = Number(options['upload_max_file_limit']);
      this.fileSizeWithKB = Number(options['upload_max_file_size']);
      this.fileSizeWithMB = this.fileSizeWithKB / 1024;
      this.fileSizeWithByte = this.fileSizeWithKB * 1024;
    });
    this.updatePageInfo();
  }

  ngOnDestroy(): void {
    this.optionsListener.unsubscribe();
  }

  onPreview = async (file: NzUploadFile): Promise<void> => {
    if (!file.type || !this.imageTypes.includes(file.type)) {
      this.message.warning('预览只支持jpg、png格式图片');
      return;
    }
    if (!file.url && !file['preview']) {
      file['preview'] = await this.previewImage(file as any);
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
    const formData = new FormData();
    this.fileList.forEach((file: any) => {
      formData.append('files', file);
    });
    formData.append('original', this.uploadForm.value.original ? '1' : '0');
    formData.append('watermark', this.uploadForm.value.watermark ? '1' : '0');

    this.uploading = true;
    this.postService.uploadFiles(formData).subscribe((res) => {
      this.uploading = false;
      if (res.code === ResponseCode.SUCCESS) {
        this.message.success(Message.SUCCESS);
        this.router.navigate(['/resources']);
      }
    });
  }

  protected updateBreadcrumb(breadcrumbData?: BreadcrumbData): void {
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private previewImage(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const maxPreviewSize = 1024;
      const canvas = this.document.createElement('canvas');
      canvas.width = maxPreviewSize;
      canvas.height = maxPreviewSize;
      canvas.style.cssText = `position: fixed; left: 0; top: 0; ` +
        `width: ${maxPreviewSize}px; height: ${maxPreviewSize}px; z-index: 9999; display: none;`;
      this.document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      img.onload = () => {
        const { width, height } = img;

        let drawWidth = width;
        let drawHeight = height;
        let offsetX = 0;
        let offsetY = 0;

        if (width < height) {
          if (height > maxPreviewSize) {
            drawWidth = width * maxPreviewSize / height;
            drawHeight = maxPreviewSize;
          }
        } else {
          if (width > maxPreviewSize) {
            drawWidth = maxPreviewSize;
            drawHeight = height * maxPreviewSize / width;
          }
        }

        canvas.width = drawWidth;
        canvas.height = drawHeight;

        try {
          ctx!.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        } catch {}
        const dataURL = canvas.toDataURL();
        this.document.body.removeChild(canvas);

        URL.revokeObjectURL(objectUrl);
        resolve( dataURL);
      };
    });
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
}
