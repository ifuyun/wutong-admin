import { BreadcrumbEntity } from '../../components/breadcrumb/breadcrumb.interface';
import { CommentFlag, PostOriginal, PostStatus, PostType } from '../../config/common.enum';
import { UserEntity } from '../../interfaces/user.interface';
import { TaxonomyEntity } from '../taxonomies/taxonomy.interface';

export interface PostEntity {
  postId: string;
  postTitle: string;
  postContent: string;
  postExcerpt: string;
  postDate: Date;
  postGuid: string;
  postStatus: string;
  commentFlag: string;
  postAuthor?: string;
  postOriginal: number;
  postPassword?: string;
  postParent?: string;
  postType?: string;
}

export interface PostModel extends PostEntity {
  postCreated?: Date;
  postModified?: Date;
  postViewCount?: number;
  commentCount?: number;
  author?: UserEntity;
  postName?: string;
  postMimeType?: string;
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

export interface PostSaveParam extends PostEntity {
  postSource: string;
  postTaxonomies: string[];
  postTags?: string[];
  showWechatCard: 0 | 1 | 2;
  copyrightType: 0 | 1 | 2;
  updateModified: 0 | 1;
}

export interface FileSaveParam {
  postId: string;
  postTitle: string;
  postExcerpt: string;
  postStatus: PostStatus;
  postOriginal: PostOriginal;
  postTags: string[];
}
