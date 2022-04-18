import { TaxonomyStatus, TaxonomyType } from '../../config/common.enum';

export interface TaxonomyEntity {
  taxonomyName: string;
  taxonomySlug: string;
  taxonomyDescription?: string;
  taxonomyId: string;
  taxonomyParent?: string;
  taxonomyStatus: TaxonomyStatus;
  taxonomyOrder?: number;
  taxonomyIsRequired?: 0 | 1;
  objectCount?: number;
}

export interface TaxonomyModel extends TaxonomyEntity {
  taxonomyType?: TaxonomyType;
  taxonomyCreated?: Date;
  taxonomyModified?: Date;
}

export interface TaxonomyList {
  taxonomies?: TaxonomyModel[];
  page?: number;
  total?: number;
}

export interface TaxonomyQueryParam {
  type: string;
  status?: TaxonomyStatus | TaxonomyStatus[];
  page?: number;
  pageSize?: number;
  keyword?: string;
  orders?: string[][];
}

export interface TaxonomySaveParam {
  taxonomyId?: string;
  taxonomyType: string;
  taxonomyName: string;
  taxonomySlug: string;
  taxonomyDescription: string;
  taxonomyParent?: string;
  taxonomyOrder: number;
  taxonomyStatus: string;
}
