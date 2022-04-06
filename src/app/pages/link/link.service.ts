import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrl } from '../../config/api-url';
import { ApiService } from '../../core/api.service';
import { HttpResponseEntity } from '../../interfaces/http-response';
import { LinkList, LinkQueryParam, LinkSaveParam } from './link.interface';

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

  saveLink(param: LinkSaveParam): Observable<HttpResponseEntity> {
    return this.apiService.httpPost(this.apiService.getApiUrl(ApiUrl.SAVE_LINKS), param);
  }

  deleteLinks(linkIds: string[]): Observable<HttpResponseEntity> {
    return this.apiService.httpDelete(this.apiService.getApiUrl(ApiUrl.DELETE_LINKS), {
      linkIds
    });
  }
}
