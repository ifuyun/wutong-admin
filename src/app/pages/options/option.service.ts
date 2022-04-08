import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiUrl } from '../../config/api-url';
import { ApiService } from '../../core/api.service';
import { HttpResponseEntity } from '../../interfaces/http-response';
import { OptionEntity } from '../../interfaces/option.interface';

@Injectable({
  providedIn: 'root'
})
export class OptionService {
  private options: BehaviorSubject<OptionEntity> = new BehaviorSubject<OptionEntity>({});
  public options$: Observable<OptionEntity> = this.options.asObservable();

  constructor(
    private apiService: ApiService
  ) {
  }

  getOptions(): Observable<OptionEntity> {
    return this.apiService.httpGet(this.apiService.getApiUrl(ApiUrl.GET_OPTIONS), {
      autoload: 0
    }).pipe(
      map((res) => res?.data || {}),
      tap((options) => {
        this.options.next(options);
      })
    );
  }

  saveOptions(param: Record<string, any>): Observable<HttpResponseEntity> {
    return this.apiService.httpPost(this.apiService.getApiUrl(ApiUrl.SAVE_OPTIONS_GENERAL), param);
  }
}
