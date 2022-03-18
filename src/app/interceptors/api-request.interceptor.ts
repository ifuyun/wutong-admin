import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class ApiRequestInterceptor implements HttpInterceptor {
  intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    if (token) {
      httpRequest = httpRequest.clone({
        headers: httpRequest.headers.set('Authorization', 'Bearer ' + token)
      });
    }
    return next.handle(httpRequest);
  }
}
