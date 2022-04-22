import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Observable } from 'rxjs';
import { UrlService } from './core/url.service';
import { OptionEntity } from './pages/options/option.interface';
import { LoginUserEntity } from './pages/users/user.interface';
import { MenuItem, MenuService } from './core/menu.service';
import { OptionService } from './pages/options/option.service';
import { UserService } from './pages/users/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  isCollapsed = false;
  menus: MenuItem[];
  openMap: Record<string, boolean> = {};
  selectedMap: Record<string, boolean> = {};
  options$!: Observable<OptionEntity>;
  loginUser!: LoginUserEntity;
  isLoggedIn = false;

  private currentUrl: string = '';

  constructor(
    private optionService: OptionService,
    private userService: UserService,
    private menusService: MenuService,
    private urlService: UrlService,
    private router: Router
  ) {
    this.options$ = optionService.options$;
    this.menus = this.menusService.menus;
    this.menus.forEach((item) => {
      this.openMap[item.key] = false;
    });
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.urlService.updatePreviousUrl({
        previous: this.currentUrl,
        current: (event as NavigationEnd).url
      });
      this.currentUrl = (event as NavigationEnd).url;

      const checkedMenuKey = this.getMenuKeyByUrl(this.currentUrl.split('?')[0]);
      this.resetMenuStatus();
      checkedMenuKey.rootMenuKey && (this.openMap[checkedMenuKey.rootMenuKey] = true);
      checkedMenuKey.childMenuKey && (this.selectedMap[checkedMenuKey.childMenuKey] = true);
    });
    this.optionService.getOptions().subscribe();
    this.userService.loginUser$.subscribe((user) => {
      this.loginUser = user;
      this.isLoggedIn = this.userService.isLoggedIn;
    });
  }

  openHandler(value: string): void {
    for (const key in this.openMap) {
      if (key !== value) {
        this.openMap[key] = false;
      }
    }
  }

  private getMenuKeyByUrl(url: string): { childMenuKey: string, rootMenuKey: string } {
    let childMenu: MenuItem | undefined;
    const iterator = (menus: MenuItem[], cb: Function) => {
      for (let menu of menus) {
        if (menu.url === url) {
          cb(menu);
          break;
        }
        if (menu.children) {
          iterator(menu.children, cb);
        }
      }
    };
    iterator(this.menus, (menu: MenuItem) => childMenu = menu);
    const rootMenu: MenuItem | undefined = childMenu && this.menusService.getRootMenu(childMenu);

    return {
      childMenuKey: childMenu?.key || '',
      rootMenuKey: rootMenu?.key || ''
    };
  }

  private resetMenuStatus() {
    this.openMap = {};
    this.selectedMap = {};
  }
}
