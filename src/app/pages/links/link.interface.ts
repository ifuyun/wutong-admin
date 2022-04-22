import { LinkStatus, LinkTarget, LinkScope } from '../../config/common.enum';
import { TaxonomyModel } from '../taxonomies/taxonomy.interface';

export interface LinkEntity {
  linkId: string;
  linkName: string;
  linkUrl: string;
  linkDescription: string;
  linkScope: LinkScope;
  linkStatus: LinkStatus;
  linkTarget: LinkTarget;
  linkRating: number;
  linkImage?: string;
}

export interface LinkModel extends LinkEntity {
  linkOwner?: string;
  linkRss?: string;
  linkCreated?: Date;
  linkModified?: Date;
  taxonomies?: TaxonomyModel[];
}

export interface LinkList {
  links?: LinkModel[];
  page?: number;
  total?: number;
}

export interface LinkQueryParam {
  page: number;
  pageSize?: number;
  keyword?: string;
  taxonomyId?: string;
  target?: LinkTarget | LinkTarget[];
  scope?: LinkScope | LinkScope[];
  status?: LinkStatus | LinkStatus[];
  orders?: string[][];
}

export interface LinkSaveParam extends LinkEntity {
  linkTaxonomy: string;
}
