import { CommentStatus } from '../../config/common.enum';
import { PostModel } from '../post/post.interface';

export interface CommentEntity {
  postId: string;
  parentId?: string;
  commentAuthor: string;
  commentAuthorEmail: string;
  commentContent: string;
  captchaCode?: string;
}

export interface CommentModel extends CommentEntity {
  commentId: string;
  commentStatus: string;
  created: Date;
  modified: Date;
  commentVote: number;
  commentAuthorLink: string;
  commentIp: string;
  commentAgent: string;
  parentId: string;
  userId: string;
  post?: PostModel;
}

export interface CommentList {
  comments?: CommentModel[];
  page?: number;
  total?: number;
}

export interface CommentQueryParam {
  page: number;
  pageSize?: number;
  from?: string;
  postId?: string;
  keyword?: string;
  status?: CommentStatus;
  orders?: string[][];
}
