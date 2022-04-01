import { Injectable } from '@angular/core';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrl } from '../../config/api-url';
import { TaxonomyType } from '../../config/common.enum';
import { ApiService } from '../../core/api.service';
import { HttpResponseEntity } from '../../interfaces/http-response';
import { TaxonomyList, TaxonomyModel, TaxonomyQueryParam } from './taxonomy.interface';

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
      key: bySlug ? item.slug : item.taxonomyId,
      title: item.name,
      taxonomyId: item.taxonomyId,
      parentId: item.parentId,
      status: item.status
    }));
    return nodes.filter((father) => {
      father.children = nodes.filter((child) => father['taxonomyId'] === child['parentId']);
      father.isLeaf = father.children.length < 1;
      father.selected = false;
      return !father['parentId'];
    });
  }

  getTaxonomyIdBySlug(taxonomies: TaxonomyModel[], slug: string): string {
    const result = taxonomies.filter((item) => item.slug === slug);
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
          if (item.parentId) {
            iterator(item.parentId);
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
}
