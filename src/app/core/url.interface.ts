import { Params } from '@angular/router';

export interface UrlHistory {
  previous: string;
  current: string;
}

export interface UrlInfo {
  path: string;
  params: Params;
}
