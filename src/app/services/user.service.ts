import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '../core/api.service';
import { ApiUrl } from '../enums/api-url';
import { UserEntity } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user: BehaviorSubject<UserEntity> = new BehaviorSubject<UserEntity>({});
  user$: Observable<UserEntity> = this.user.asObservable();
  isLoggedIn = false;

  constructor(
    private apiService: ApiService
  ) {
  }

  getLoginUser(): Observable<UserEntity> {
    if (this.isLoggedIn) {
      return this.user$;
    }
    return this.apiService.httpGet(this.apiService.getApiUrl(ApiUrl.GET_LOGIN_USER)).pipe(
      map((res) => res?.data || {}),
      tap((user) => {
        this.isLoggedIn = !!user.userName;
        this.user.next(user);
      })
    );
  }
}
