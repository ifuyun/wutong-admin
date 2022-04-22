import { Injectable } from '@angular/core';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrl } from '../../config/api-url';
import { TaxonomyStatus, TaxonomyType } from '../../config/common.enum';
import { ApiService } from '../../core/api.service';
import { HttpResponseEntity } from '../../core/http-response.interface';
import { TaxonomyList, TaxonomyModel, TaxonomyQueryParam, TaxonomySaveParam } from './taxonomy.interface';

@Injectable({
  providedIn: 'root'
})
export class TaxonomyService {
  constructor(private apiService: ApiService) {
  }

  getTaxonomies(param: TaxonomyQueryParam): Observable<TaxonomyList> {
    return this.apiService.httpGet(this.apiService.getApiUrl(ApiUrl.GET_TAXONOMIES), param).pipe(
      map((res) => res?.data || [])
    );
  }

  generateTaxonomyTree(taxonomies: TaxonomyModel[], bySlug = false) {
    const nodes: NzTreeNodeOptions[] = taxonomies.map((item) => ({
      key: bySlug ? item.taxonomySlug : item.taxonomyId,
      title: item.taxonomyName,
      taxonomyId: item.taxonomyId,
      parentId: item.taxonomyParent,
      status: item.taxonomyStatus,
      isDeleted: item.taxonomyStatus === TaxonomyStatus.TRASH
    }));
    return nodes.filter((father) => {
      father.children = nodes.filter((child) => father['taxonomyId'] === child['parentId']);
      father.isLeaf = father.children.length < 1;
      father.selected = false;
      return !father['parentId'];
    });
  }

  getTaxonomyIdBySlug(taxonomies: TaxonomyModel[], slug: string): string {
    const result = taxonomies.filter((item) => item.taxonomySlug === slug);
    if (result.length > 0) {
      return result[0].taxonomyId;
    }
    return '';
  }

  getParentTaxonomies(taxonomyList: TaxonomyModel[], taxonomyId: string): TaxonomyModel[] {
    const parentNodes: TaxonomyModel[] = [];
    if (!taxonomyId) {
      return [];
    }
    const iterator = (parentId: string) => {
      taxonomyList.forEach((item) => {
        if (item.taxonomyId === parentId) {
          parentNodes.push(item);
          if (item.taxonomyParent) {
            iterator(item.taxonomyParent);
          }
        }
      });
    };
    iterator(taxonomyId);
    return parentNodes;
  }

  searchTags(keyword: string): Observable<string[]> {
    if (!keyword) {
      return of([]);
    }
    return this.apiService.httpGet(this.apiService.getApiUrl(ApiUrl.GET_TAGS), {
      keyword
    }).pipe(
      map((res) => res?.data || [])
    );
  }

  getAllChildren(taxonomies: NzTreeNodeOptions[], taxonomyIds: string[]) {
    const result: string[] = [];
    const findChildren = (nodes: NzTreeNodeOptions[]) => {
      nodes.forEach((node) => {
        result.push(node['taxonomyId']);
        if (node.children && node.children.length > 0) {
          findChildren(node.children);
        }
      })
    }
    const findNode = (nodes: NzTreeNodeOptions[], id: string) => {
      nodes.forEach((node) => {
        if (node['taxonomyId'] === id) {
          findChildren([node]);
        } else {
          if (node.children && node.children.length > 0) {
            findNode(node.children, id);
          }
        }
      });
    };
    taxonomyIds.forEach((id) => findNode(taxonomies, id));
    return result;
  }

  updateAllCount(type: TaxonomyType): Observable<HttpResponseEntity> {
    return this.apiService.httpPost(this.apiService.getApiUrl(ApiUrl.UPDATE_TAXONOMY_OBJECT_COUNT), {
      type
    });
  }

  saveTaxonomy(param: TaxonomySaveParam): Observable<HttpResponseEntity> {
    return this.apiService.httpPost(this.apiService.getApiUrl(ApiUrl.SAVE_TAXONOMIES), param);
  }

  deleteTaxonomies(type: TaxonomyType, taxonomyIds: string[]): Observable<HttpResponseEntity> {
    return this.apiService.httpDelete(this.apiService.getApiUrl(ApiUrl.DELETE_TAXONOMIES), {
      taxonomyType: type,
      taxonomyIds
    });
  }
}
