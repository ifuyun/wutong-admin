import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrl } from '../../config/api-url';
import { ApiService } from '../../core/api.service';
import { LinkList, LinkQueryParam } from './link.interface';

@Injectable({
  providedIn: 'root'
})
export class LinkService {
  constructor(private apiService: ApiService) {
  }

  getLinks(param: LinkQueryParam): Observable<LinkList> {
    return this.apiService.httpGet(this.apiService.getApiUrl(ApiUrl.GET_LINKS), param).pipe(
      map((res) => res?.data || {})
    );
  }
}
