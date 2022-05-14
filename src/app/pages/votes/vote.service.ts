import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrl } from '../../config/api-url';
import { ApiService } from '../../core/api.service';
import { VoteList, VoteQueryParam } from './vote.interface';

@Injectable({
  providedIn: 'root'
})
export class VoteService {
  constructor(private apiService: ApiService) {
  }

  getVotes(param: VoteQueryParam): Observable<VoteList> {
    return this.apiService.httpGet(this.apiService.getApiUrl(ApiUrl.GET_VOTES), param).pipe(
      map((res) => res?.data || {})
    );
  }
}
