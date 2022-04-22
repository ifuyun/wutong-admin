import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { UrlInfo, UrlHistory } from './url.interface';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  private urlInfo: BehaviorSubject<UrlHistory> = new BehaviorSubject<UrlHistory>({ previous: '', current: '' });
  public urlInfo$: Observable<UrlHistory> = this.urlInfo.asObservable();

  updatePreviousUrl(urlInfo: UrlHistory) {
    this.urlInfo.next(urlInfo);
  }

  parseUrl(url: string): UrlInfo {
    const segments = url.split('#')[0].split('?');
    const params: Params = {};
    if (segments.length > 1) {
      const searches = segments[1].split('&');
      searches.forEach((item) => {
        const search = item.split('=');
        params[search[0]] = decodeURIComponent(search[1]);
      });
    }
    return {
      path: segments[0],
      params
    };
  }
}
