import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiUrl } from '../config/api-url';
import { Message } from '../config/message.enum';
import { HttpResponseEntity } from '../interfaces/http-response';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrlPrefix: string = ApiUrl.API_URL_PREFIX;

  constructor(
    private http: HttpClient,
    private message: NzMessageService
  ) {
  }

  getApiUrl(path: string): string {
    return `${this.apiUrlPrefix}${path}`;
  }

  getApiUrlWithParam(path: string, ...args: string[]): string {
    let idx = 0;
    return this.apiUrlPrefix + path.replace(/(:[a-zA-Z0-9\-_]+)/ig, (matched) => {
      return args[idx++] || matched;
    });
  }

  httpGet<T extends HttpResponseEntity>(url: string, param: Record<string, any> = {}): Observable<T> {
    return this.http.get<T>(url, {
      params: new HttpParams({
        fromObject: param
      }),
      observe: 'body'
    }).pipe(
      catchError(this.handleError<T>())
    );
  }

  httpGetData<T extends HttpResponseEntity>(url: string, param: Record<string, any> = {}): Observable<any> {
    return this.http.get<T>(url, {
      params: new HttpParams({
        fromObject: param
      }),
      observe: 'body'
    }).pipe(
      map((res) => res?.data),
      catchError(this.handleError<T>())
    );
  }

  httpPost<T extends HttpResponseEntity>(url: string, body: Record<string, any> | FormData = {}): Observable<T> {
    return this.http.post<T>(url, body, {
      observe: 'body'
    }).pipe(
      catchError(this.handleError<T>())
    );
  }

  private handleError<T>() {
    return (error: HttpErrorResponse): Observable<T> => {
      this.message.error(error.error?.message || error.message || Message.UNKNOWN_ERROR);
      // Let the app keep running by returning an empty result.
      return of(error.error as T);
    };
  }
}
