import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrl } from '../../config/api-url';
import { ApiService } from '../../core/api.service';
import { TaxonomyList, TaxonomyQueryParam } from './taxonomy.interface';

@Injectable({
  providedIn: 'root'
})
export class TaxonomyService {
  constructor(private apiService: ApiService) {
  }

  getTaxonomies(param: TaxonomyQueryParam):Observable<TaxonomyList> {
    return this.apiService.httpGet(this.apiService.getApiUrl(ApiUrl.GET_TAXONOMIES), param).pipe(
      map((res) => res?.data || [])
    );
  }
}
