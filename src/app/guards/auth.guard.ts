import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UsersService } from '../services/users.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    private usersService: UsersService,
    private router: Router
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.checkLogin(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.checkLogin(state.url);
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> {
    return this.checkLogin(`/${route.path}`);
  }

  checkLogin(url?: string): Observable<boolean | UrlTree> {
    // todo: check auth by url & role
    return this.usersService.getLoginUser().pipe(map((user) => {
      const isLoggedIn = !!user.userName;
      if (!isLoggedIn) {
        location.href = '/user/login';
        return false;
      }
      if (!user.isAdmin) {
        return this.router.parseUrl('/forbidden');
      }
      return true;
    }));
  }
}
