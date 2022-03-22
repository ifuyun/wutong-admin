import { CommentStatus } from '../../config/common.enum';
import { PostModel } from '../post/post.interface';

export interface CommentDto {
  postId: string;
  parentId?: string;
  commentAuthor: string;
  commentAuthorEmail: string;
  commentContent: string;
  captchaCode?: string;
}

export interface CommentEntity extends CommentDto {
  commentId: string;
  commentStatus: string;
  created: Date;
  modified: Date;
  commentVote: number;
  post?: PostModel;
}

export interface CommentModel {
  commentAuthorLink: string;
  commentIp: string;
  commentAgent: string;
  parentId: string;
  userId: string;
}
export interface CommentList {
  comments?: CommentEntity[];
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
