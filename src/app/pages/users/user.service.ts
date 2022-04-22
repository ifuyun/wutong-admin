import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import { ApiUrl } from '../../config/api-url';
import { LoginUserEntity } from './user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private loginUser: BehaviorSubject<LoginUserEntity> = new BehaviorSubject<LoginUserEntity>({});
  loginUser$: Observable<LoginUserEntity> = this.loginUser.asObservable();
  isLoggedIn = false;

  constructor(
    private apiService: ApiService
  ) {
  }

  getLoginUser(): Observable<LoginUserEntity> {
    if (this.isLoggedIn) {
      return this.loginUser$;
    }
    return this.apiService.httpGet(this.apiService.getApiUrl(ApiUrl.GET_LOGIN_USER)).pipe(
      map((res) => res?.data || {}),
      tap((loginUser) => {
        this.isLoggedIn = !!loginUser.userName;
        this.loginUser.next(loginUser);
      })
    );
  }
}
