import { Injectable } from '@angular/core';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrl } from '../../config/api-url';
import { ApiService } from '../../core/api.service';
import { TaxonomyList, TaxonomyModel, TaxonomyNode, TaxonomyQueryParam } from './taxonomy.interface';

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

  generateTaxonomyTree(taxonomies: TaxonomyNode[]) {
    const nodes: NzTreeNodeOptions[] = taxonomies.map((item) => ({
      key: item.slug,
      title: item.name,
      taxonomyId: item.taxonomyId,
      parentId: item.parentId
    }));
    return nodes.filter((father) => {
      father.children = nodes.filter((child) => father['taxonomyId'] === child['parentId']);
      father.isLeaf = father.children.length < 1;
      father.selected = false;
      return !father['parentId'];
    });
  }

  getTaxonomyIdBySlug(taxonomies: TaxonomyNode[], slug: string): string {
    const result = taxonomies.filter((item) => item.slug === slug);
    if (result.length > 0) {
      return result[0].taxonomyId;
    }
    return '';
  }

  getParentTaxonomies(nodes: TaxonomyModel[], nodeId: string): TaxonomyModel[] {
    const parentNodes: TaxonomyModel[] = [];
    if (!nodeId) {
      return [];
    }
    const iterator = (parentId: string) => {
      nodes.forEach((item) => {
        if (item.taxonomyId === parentId) {
          parentNodes.push(item);
          if (item.parentId) {
            iterator(item.parentId);
          }
        }
      });
    };
    iterator(nodeId);
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
}
