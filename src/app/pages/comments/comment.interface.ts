import { CommentAuditAction, CommentStatus } from '../../config/common.enum';
import { PostModel } from '../posts/post.interface';

export interface CommentEntity {
  postId: string;
  commentParent?: string;
  commentTop?: string;
  authorName: string;
  authorEmail: string;
  commentContent: string;
  captchaCode?: string;
}

export interface CommentModel extends CommentEntity {
  commentId: string;
  commentStatus: string;
  commentCreated: Date;
  commentModified: Date;
  authorEmailHash?: string;
  authorLink: string;
  authorIp: string;
  authorUserAgent: string;
  commentParent: string;
  userId: string;
  commentLikes: number;
  commentDislikes: number;
  post: PostModel;
}

export interface Comment extends CommentModel {
  children: CommentModel[];
}

export interface CommentList {
  comments?: Comment[];
  page?: number;
  total?: number;
}

export interface CommentQueryParam {
  page: number;
  pageSize?: number;
  fa?: 0 | 1;
  postId?: string;
  keyword?: string;
  status?: CommentStatus[];
  orders?: string[][];
}

export interface CommentAuditParam {
  commentIds: string[];
  action: CommentAuditAction;
}

export interface CommentSaveParam {
  postId: string;
  commentId?: string;
  commentContent: string;
  commentParent?: string;
  commentTop?: string;
  commentStatus?: CommentStatus;
  authorName: string;
  authorEmail: string;
  fa?: boolean;
}
