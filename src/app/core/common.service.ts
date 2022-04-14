import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiUrl } from '../config/api-url';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  constructor(
    private apiService: ApiService
  ) {
  }

  getStatData(): Observable<Record<string, number>> {
    return this.apiService.httpGet(this.apiService.getApiUrl(ApiUrl.GET_STATISTICS)).pipe(
      map((res) => res?.data || {})
    );
  }
}
