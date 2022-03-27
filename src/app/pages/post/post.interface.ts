import { BreadcrumbEntity } from '../../components/breadcrumb/breadcrumb.interface';
import { CommentFlag, PostStatus, PostType } from '../../config/common.enum';
import { TaxonomyEntity } from '../taxonomy/taxonomy.interface';
import { UserEntity } from '../../interfaces/user.interface';

export interface PostEntity {
  postId: string;
  postTitle: string;
  postGuid: string;
  postAuthor: string;
  postDate: Date;
  postContent: string;
  postExcerpt: string;
  postStatus: string;
  commentFlag: string;
  postOriginal: number;
  postPassword: string;
  postModified: Date;
  postCreated: Date;
  postParent: string;
  postType: string;
  commentCount: number;
  postViewCount: number;
  author: UserEntity;
}

export interface PostModel extends PostEntity {
  postName: string;
  postMimeType: string;
}

export interface Post {
  post: PostModel;
  meta: Record<string, string>;
  tags: TaxonomyEntity[];
  categories: TaxonomyEntity[];
  crumbs?: BreadcrumbEntity[];
}

export interface PostList {
  posts?: Post[];
  page?: number;
  total?: number;
}

export interface PostArchiveDate {
  dateText: string;
  dateTitle: string;
  count?: number;
}

export interface PostQueryParam {
  type: PostType;
  page: number;
  pageSize?: number;
  fa?: 0 | 1;
  keyword?: string;
  category?: string;
  tag?: string;
  year?: string;
  month?: string;
  status?: PostStatus[];
  commentFlag?: CommentFlag[];
  author?: string;
  orders?: string[][];
}

export interface PostArchiveDatesQueryParam {
  postType?: PostType;
  status?: PostStatus[];
  showCount: boolean;
  limit?: number;
  fa?: 0 | 1;
}
