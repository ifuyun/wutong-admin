import { LinkVisible } from '../../config/common.enum';

export interface LinkModel {
  linkId: string;
  linkUrl: string;
  linkName: string;
  linkImage: string;
  linkTarget: string;
  linkDescription: string;
  linkVisible: LinkVisible;
  linkOwner: string;
  linkOrder: number;
  linkRss: string;
  created: Date;
  modified: Date;
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
  visible?: LinkVisible | LinkVisible[];
  orders?: string[][];
}
