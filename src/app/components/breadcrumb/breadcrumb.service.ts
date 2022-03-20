import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BreadcrumbData } from './breadcrumb.interface';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbSource: BehaviorSubject<BreadcrumbData> = new BehaviorSubject<BreadcrumbData>({
    visible: false,
    list: []
  });
  public breadcrumb$: Observable<BreadcrumbData> = this.breadcrumbSource.asObservable();

  updateCrumb(breadcrumbData: BreadcrumbData) {
    this.breadcrumbSource.next(breadcrumbData);
  }
}
