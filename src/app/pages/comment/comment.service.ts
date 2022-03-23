import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrl } from '../../config/api-url';
import { ApiService } from '../../core/api.service';
import { HttpResponseEntity } from '../../interfaces/http-response';
import { CommentAuditParam, CommentList, CommentQueryParam } from './comment.interface';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  constructor(private apiService: ApiService) {
  }

  getComments(param: CommentQueryParam): Observable<CommentList> {
    return this.apiService.httpGet(this.apiService.getApiUrl(ApiUrl.GET_COMMENTS), param).pipe(
      map((res) => res?.data || {})
    );
  }

  auditComments(param: CommentAuditParam): Observable<HttpResponseEntity> {
    return this.apiService.httpPost(this.apiService.getApiUrl(ApiUrl.AUDIT_COMMENTS), param);
  }
}
