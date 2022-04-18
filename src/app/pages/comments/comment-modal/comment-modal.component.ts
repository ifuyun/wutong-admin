import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { CommentAction, CommentStatus } from '../../../config/common.enum';
import { COMMENT_LENGTH, COMMENT_STATUS_LIST } from '../../../config/constants';
import { Message } from '../../../config/message.enum';
import { ResponseCode } from '../../../config/response-code.enum';
import { BaseComponent } from '../../../core/base.component';
import { LoginUserEntity } from '../../../interfaces/user.interface';
import { UserService } from '../../users/user.service';
import { CommentModel, CommentSaveParam } from '../comment.interface';
import { CommentService } from '../comment.service';

@Component({
  selector: 'i-comment-modal',
  templateUrl: './comment-modal.component.html',
  styleUrls: ['./comment-modal.component.less']
})
export class CommentModalComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() visible: boolean = false;
  @Output() closeModal = new EventEmitter();
  @Input() action!: CommentAction;
  @Input() comment!: CommentModel;
  @Output() onSuccess = new EventEmitter();

  readonly commentMaxLength = COMMENT_LENGTH;

  commentForm: FormGroup = this.fb.group({
    commentContent: ['', [Validators.required, Validators.maxLength(this.commentMaxLength)]],
    commentStatus: ['']
  });
  commentStatusList = COMMENT_STATUS_LIST;
  saveLoading = false;

  private user!: LoginUserEntity;
  private userListener!: Subscription;

  constructor(
    private commentService: CommentService,
    private userService: UserService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    super();
  }

  ngOnInit(): void {
    this.userListener = this.userService.loginUser$.subscribe((user) => {
      this.user = user;
    });
    this.commentForm.setValue({
      commentContent: this.action === CommentAction.EDIT ? this.comment.commentContent : '',
      commentStatus: this.comment.commentStatus
    });
  }

  ngOnDestroy(): void {
    this.userListener.unsubscribe();
  }

  saveComment() {
    if (this.action === CommentAction.DETAIL) {
      this.closeCommentModal();
      return;
    }
    const { value, valid } = this.validateForm(this.commentForm);
    if (!valid) {
      return;
    }
    this.saveLoading = true;
    let commentData: CommentSaveParam;
    if (this.action === CommentAction.EDIT) {
      commentData = {
        commentId: this.comment.commentId,
        postId: this.comment.post.postId,
        commentContent: value.commentContent,
        commentStatus: value.commentStatus,
        commentAuthor: this.user.userName || '',
        commentAuthorEmail: this.user.userEmail || ''
      };
    } else {
      commentData = {
        commentParent: this.comment.commentId,
        postId: this.comment.post.postId,
        commentContent: value.commentContent,
        commentStatus: CommentStatus.NORMAL,
        commentAuthor: this.user.userName || '',
        commentAuthorEmail: this.user.userEmail || ''
      };
    }
    this.commentService.saveComment(commentData).subscribe((res) => {
      this.saveLoading = false;
      if (res.code === ResponseCode.SUCCESS) {
        this.message.success(Message.SUCCESS);
        this.onSuccess.emit();
        this.closeCommentModal();
      }
    });
  }

  closeCommentModal() {
    this.closeModal.emit();
  }
}
