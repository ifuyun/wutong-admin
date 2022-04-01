import { TaxonomyStatus, TaxonomyType } from '../../config/common.enum';

export interface TaxonomyEntity {
  name: string;
  slug: string;
  description?: string;
  taxonomyId: string;
  parentId?: string;
  status: TaxonomyStatus;
  termOrder?: number;
  count?: number;
}

export interface TaxonomyModel extends TaxonomyEntity {
  type?: TaxonomyType;
  termGroup?: number;
  created?: Date;
  modified?: Date;
}

export interface TaxonomyList {
  taxonomies?: TaxonomyModel[];
  page?: number;
  total?: number;
}

export interface TaxonomyQueryParam {
  type: string;
  status?: TaxonomyStatus | TaxonomyStatus[];
  page: number;
  pageSize?: number;
  keyword?: string;
  orders?: string[][];
}

export interface TaxonomySaveParam {
  taxonomyId?: string;
  type: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  termOrder: number;
  status: string;
}
