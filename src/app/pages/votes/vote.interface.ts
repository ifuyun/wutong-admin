import { VoteType } from '../../config/common.enum';
import { CommentModel } from '../comments/comment.interface';
import { PostModel } from '../posts/post.interface';

export interface VoteModel {
  voteId: string;
  objectId: string;
  comment: CommentModel;
  post: PostModel;
  postMeta: Record<string, string>;
  objectType: VoteType;
  voteResult: number;
  voteCreated: Date;
  userId: string;
  userIp: string;
  userAgent: string;
}

export interface VoteList {
  votes?: VoteModel[];
  page?: number;
  total?: number;
}

export interface VoteQueryParam {
  page: number;
  pageSize?: number;
  ip?: string;
  keyword?: string;
  type?: VoteType[];
  orders?: string[][];
}
