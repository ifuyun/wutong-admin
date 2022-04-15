import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Duration } from 'moment';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { CommentAction, CommentAuditAction } from '../../../config/common.enum';
import { SERVER_START_AT } from '../../../config/constants';
import { Message } from '../../../config/message.enum';
import { ResponseCode } from '../../../config/response-code.enum';
import { PageComponent } from '../../../core/page.component';
import { CommonService } from '../../../core/common.service';
import { OptionEntity } from '../../../interfaces/option.interface';
import { CommentModel } from '../../comments/comment.interface';
import { CommentService } from '../../comments/comment.service';
import { OptionService } from '../../options/option.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent extends PageComponent implements OnInit, OnDestroy {
  serverDuration!: Duration;
  statData!: Record<string, number>;
  comments!: CommentModel[];
  commentModalVisible = false;
  commentAction!: CommentAction;
  activeComment!: CommentModel;

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: false,
    list: []
  };

  private auditLoading = false;
  private options: OptionEntity = {};
  private optionsListener!: Subscription;
  private statListener!: Subscription;
  private serverTimer!: any;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionService: OptionService,
    private commonService: CommonService,
    private commentService: CommentService,
    private message: NzMessageService,
    private modal: NzModalService
  ) {
    super();
  }


  ngOnInit() {
    this.optionsListener = this.optionService.options$.subscribe((options) => {
      this.options = options;
    });
    this.updatePageInfo();
    this.updateDuration();
    this.statListener = this.commonService.getStatData().subscribe((res) => {
      this.statData = res;
    });
    this.fetchComments();
    this.serverTimer = setInterval(() => this.updateDuration(), 60000);
  }

  ngOnDestroy(): void {
    this.optionsListener.unsubscribe();
    this.statListener.unsubscribe();
    clearInterval(this.serverTimer);
  }

  showCommentModal(action: string, comment: CommentModel) {
    this.commentAction = <CommentAction>action;
    this.activeComment = comment;
    this.commentModalVisible = true;
  }

  closeCommentModal() {
    this.commentModalVisible = false;
  }

  onCommentSave() {
    this.fetchComments();
  }

  auditComments(action: string, commentId: string) {
    let actionDesc: string;
    let modalContent: string;
    switch (action) {
      case CommentAuditAction.RESOLVE:
        actionDesc = '批准';
        modalContent = '确定批准这条评论吗？';
        break;
      case CommentAuditAction.TRASH:
        actionDesc = '删除';
        modalContent = '确定删除这条评论吗？';
        break;
      case CommentAuditAction.SPAM:
        actionDesc = '标记为垃圾评论';
        modalContent = '确定将这条评论标记为垃圾评论吗？';
        break;
      default:
        actionDesc = '驳回';
        modalContent = '确定驳回这条评论吗？';
    }
    const confirmModal = this.modal.confirm({
      nzTitle: `确定${actionDesc}吗？`,
      nzContent: modalContent,
      nzOkDanger: action === CommentAuditAction.TRASH,
      nzOkLoading: this.auditLoading,
      nzAutofocus: 'ok',
      nzOnOk: () => {
        this.auditLoading = true;
        this.commentService.auditComments({
          commentIds: [commentId],
          action: <CommentAuditAction>action
        }).subscribe((res) => {
          this.auditLoading = false;
          confirmModal.destroy();
          if (res.code === ResponseCode.SUCCESS) {
            this.message.success(Message.SUCCESS);
            this.fetchComments();
          }
        });
        return false;
      }
    });
  }

  protected updateBreadcrumb(breadcrumbData?: BreadcrumbData): void {
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private fetchComments() {
    this.commentService.getRecentComments(3).subscribe((res) => {
      this.comments = res;
    });
  }

  private updatePageInfo() {
    this.titles = ['仪表盘', this.options['site_name']];
    this.updateTitle();
    this.updateBreadcrumb();
  }

  private updateDuration() {
    this.serverDuration = moment.duration(moment().diff(moment(SERVER_START_AT)));
  }
}
