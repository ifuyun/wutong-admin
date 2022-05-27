import { BreadcrumbEntity } from '../../components/breadcrumb/breadcrumb.interface';
import { CommentFlag, PostOriginal, PostStatus, PostType } from '../../config/common.enum';
import { UserEntity } from '../users/user.interface';
import { TaxonomyEntity } from '../taxonomies/taxonomy.interface';

export interface PostEntity {
  postId: string;
  postTitle: string;
  postContent: string;
  postExcerpt: string;
  postDate: Date;
  postName?: string;
  postStatus: string;
  postType: PostType;
  commentFlag: string;
  postAuthor?: string;
  postOriginal: number;
  postPassword?: string;
  postParent?: string;
  postMimeType?: string;
}

export interface PostModel extends PostEntity {
  postGuid: string;
  postCreated?: Date;
  postModified?: Date;
  postViewCount?: number;
  commentCount?: number;
  postLikes?: number;
  author?: UserEntity;
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
  type: PostType | 'all';
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
  original?: string[];
  author?: string;
  orders?: string[][];
}

export interface PostArchivesQueryParam {
  postType?: PostType | 'all';
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
