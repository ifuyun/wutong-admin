import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ApiRequestInterceptor implements HttpInterceptor {
  constructor() {
  }

  intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isApiRequest = httpRequest.url.startsWith('/api');
    const token = localStorage.getItem('token');
    if (token) {
      httpRequest = httpRequest.clone({
        headers: httpRequest.headers.set('Authorization', 'Bearer ' + token)
      });
    }
    if (isApiRequest && httpRequest.responseType === 'json') {
      return next.handle(httpRequest).pipe(map((event) => this.handleJsonResponse(event)));
    }
    return next.handle(httpRequest);
  }

  private handleJsonResponse(event: HttpEvent<any>) {
    // todo
    // if (event instanceof HttpResponse) {
    // }
    return event;
  }
}
