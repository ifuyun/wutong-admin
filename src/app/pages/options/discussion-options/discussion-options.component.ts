import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { CommentFlag } from '../../../config/common.enum';
import { Message } from '../../../config/message.enum';
import { ResponseCode } from '../../../config/response-code.enum';
import { PageComponent } from '../../../core/page.component';
import { OptionEntity } from '../../../interfaces/option.interface';
import { OptionService } from '../option.service';

@Component({
  selector: 'app-discussion-options',
  templateUrl: './discussion-options.component.html',
  styleUrls: ['../option.less']
})
export class DiscussionOptionsComponent extends PageComponent implements OnInit, OnDestroy {
  saveLoading = false;
  optionsForm: FormGroup = this.fb.group({
    defaultCommentStatus: [''],
    commentRegistration: [''],
    threadComments: [''],
    threadCommentsDepth: [''],
    pageComments: [''],
    commentsPerPage: [''],
    defaultCommentsPage: [''],
    commentOrder: [''],
    commentsNotify: [''],
    moderationNotify: [''],
    commentModeration: [''],
    commentPreviouslyApproved: [''],
    showAvatars: [''],
    avatarDefault: ['']
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
    private message: NzMessageService,
    private fb: FormBuilder
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
      defaultCommentStatus: value.defaultCommentStatus ? CommentFlag.OPEN : CommentFlag.CLOSE,
      commentRegistration: value.commentRegistration,
      threadComments: value.threadComments,
      threadCommentsDepth: Number(value.threadCommentsDepth),
      pageComments: value.pageComments,
      commentsPerPage: Number(value.commentsPerPage),
      defaultCommentsPage: value.defaultCommentsPage,
      commentOrder: value.commentOrder,
      commentsNotify: value.commentsNotify,
      moderationNotify: value.moderationNotify,
      commentModeration: value.commentModeration,
      commentPreviouslyApproved: value.commentPreviouslyApproved,
      showAvatars: value.showAvatars,
      avatarDefault: value.avatarDefault
    };
    this.optionService.saveDiscussionOptions(formData).subscribe((res) => {
      this.saveLoading = false;
      if (res.code === ResponseCode.SUCCESS) {
        this.message.success(Message.SUCCESS);
      }
    });
  }

  counter(size: number) {
    return new Array(size);
  }

  protected updateBreadcrumb(breadcrumbData?: BreadcrumbData): void {
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private initForm() {
    this.optionsForm.setValue({
      defaultCommentStatus: this.options['default_comment_status'] === CommentFlag.OPEN,
      commentRegistration: this.options['comment_registration'] === '1',
      threadComments: this.options['thread_comments'] === '1',
      threadCommentsDepth: this.options['thread_comments_depth'],
      pageComments: this.options['page_comments'] === '1',
      commentsPerPage: this.options['comments_per_page'],
      defaultCommentsPage: this.options['default_comments_page'],
      commentOrder: this.options['comment_order'],
      commentsNotify: this.options['comments_notify'] === '1',
      moderationNotify: this.options['moderation_notify'] === '1',
      commentModeration: this.options['comment_moderation'] === '1',
      commentPreviouslyApproved: this.options['comment_previously_approved'] === '1',
      showAvatars: this.options['show_avatars'] === '1',
      avatarDefault: this.options['avatar_default']
    });
  }

  private updatePageInfo() {
    this.titles = ['讨论设置', '网站设置', this.options['site_name']];
    this.breadcrumbData.list = [{
      label: '网站设置',
      url: '/options',
      tooltip: '网站设置'
    }, {
      label: '讨论设置',
      url: '/options/discussion',
      tooltip: '讨论设置'
    }];
    this.updateTitle();
    this.updateBreadcrumb();
  }
}
