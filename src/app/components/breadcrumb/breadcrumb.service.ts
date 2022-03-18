import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BreadcrumbEntity } from './breadcrumb.interface';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbSource: BehaviorSubject<BreadcrumbEntity[]> = new BehaviorSubject<BreadcrumbEntity[]>([]);
  public breadcrumb$: Observable<BreadcrumbEntity[]> = this.breadcrumbSource.asObservable();

  updateCrumb(crumbs: BreadcrumbEntity[]) {
    this.breadcrumbSource.next(crumbs);
  }
}
