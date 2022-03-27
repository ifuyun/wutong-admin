import { TaxonomyStatus } from '../../config/common.enum';

export interface TaxonomyEntity {
  name: string;
  description?: string;
  slug: string;
  taxonomyId: string;
  parentId: string;
  status: number;
  termOrder: number;
  count?: number;
}

export interface TaxonomyModel extends TaxonomyEntity {
  type: string;
  termGroup: number;
  created: Date;
  modified: Date;
}

export interface TaxonomyNode extends TaxonomyModel {
  children?: TaxonomyNode[];
  isLeaf?: boolean;
  level?: number;
  isChecked?: boolean;
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
