import { CommentAuditAction, CommentStatus } from '../../config/common.enum';
import { PostModel } from '../posts/post.interface';

export interface CommentEntity {
  postId: string;
  commentParent?: string;
  commentAuthor: string;
  commentAuthorEmail: string;
  commentContent: string;
  captchaCode?: string;
}

export interface CommentModel extends CommentEntity {
  commentId: string;
  commentStatus: string;
  commentCreated: Date;
  commentModified: Date;
  commentVote: number;
  commentAuthorLink: string;
  commentIp: string;
  commentAgent: string;
  commentParent: string;
  userId: string;
  post: PostModel;
}

export interface CommentList {
  comments?: CommentModel[];
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
  commentId?: string;
  postId: string;
  commentParent?: string;
  commentContent: string;
  commentStatus?: CommentStatus;
  commentAuthor: string;
  commentAuthorEmail: string;
}
