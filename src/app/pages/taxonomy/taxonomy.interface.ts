import { TaxonomyStatus } from '../../config/common.enum';

export interface TaxonomyEntity {
  name: string;
  description?: string;
  slug: string;
  taxonomyId: string;
  parentId?: string;
  status: number;
  count?: number;
}

export interface TaxonomyModel extends TaxonomyEntity {
  type: string;
  termOrder: number;
  termGroup: number;
  created: Date;
  modified: Date;
}

export interface TaxonomyNode extends TaxonomyEntity {
  level?: number;
  children?: TaxonomyNode[];
  hasChildren?: boolean;
  isChecked?: boolean;
}

export interface TaxonomyList {
  taxonomies?: TaxonomyModel[];
  page?: number;
  total?: number;
}

export interface TaxonomyQueryParam {
  type: string;
  page: number;
  pageSize?: number;
  status?: TaxonomyStatus;
  keyword?: string;
  orders?: string[][];
}
