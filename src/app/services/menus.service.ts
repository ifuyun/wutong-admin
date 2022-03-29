import { Injectable } from '@angular/core';

export interface MenuItem {
  key: string;
  title: string;
  icon?: string;
  level: number;
  url?: string;
  order?: number;
  visible?: boolean;
  children?: MenuItem[];
  parent?: MenuItem | null;
}

@Injectable({
  providedIn: 'root'
})
export class MenusService {
  private menuData: MenuItem[] = [{
    key: 'home',
    title: '首页',
    icon: 'home',
    level: 1,
    order: 1,
    children: [{
      key: 'homeWelcome',
      title: '仪表盘',
      url: '/welcome',
      level: 2,
      order: 1
    }]
  }, {
    key: 'post',
    title: '内容管理',
    icon: 'form',
    level: 1,
    order: 2,
    children: [{
      key: 'postList',
      title: '文章列表',
      url: '/post',
      level: 2,
      order: 1
    }, {
      key: 'postForm',
      title: '写文章',
      url: '/post/edit',
      level: 2,
      order: 2
    }, {
      key: 'postStandalone',
      title: '页面列表',
      url: '/post/standalone',
      level: 2,
      order: 3
    }, {
      key: 'postFormStandalone',
      title: '创建新页面',
      url: '/post/edit-standalone',
      level: 2,
      order: 4
    }]
  }, {
    key: 'comment',
    title: '评论管理',
    icon: 'comment',
    level: 1,
    order: 3,
    children: [{
      key: 'commentList',
      title: '评论列表',
      url: '/comment',
      level: 2,
      order: 1
    }]
  }, {
    key: 'taxonomy',
    title: '类别管理',
    icon: 'tags',
    level: 1,
    order: 4,
    children: [{
      key: 'taxonomyPost',
      title: '文章分类管理',
      url: '/taxonomy/post',
      level: 2,
      order: 1
    }, {
      key: 'taxonomyTag',
      title: '标签管理',
      url: '/taxonomy/tag',
      level: 2,
      order: 2
    }, {
      key: 'taxonomyLink',
      title: '链接分类管理',
      url: '/taxonomy/link',
      level: 2,
      order: 3
    }]
  }, {
    key: 'resource',
    title: '素材管理',
    icon: 'picture',
    level: 1,
    order: 5,
    children: [{
      key: 'resourceList',
      title: '素材列表',
      url: '/resource',
      level: 2,
      order: 1
    }, {
      key: 'resourceUpload',
      title: '文件上传',
      url: '/resource/upload',
      level: 2,
      order: 2
    }]
  }, {
    key: 'link',
    title: '链接管理',
    icon: 'link',
    level: 1,
    order: 6,
    children: [{
      key: 'linkList',
      title: '链接列表',
      url: '/link',
      level: 2,
      order: 1
    }]
  }, {
    key: 'setting',
    title: '网站设置',
    icon: 'setting',
    level: 1,
    order: 7,
    children: [{
      key: 'settingList',
      title: '网站设置',
      url: '/setting',
      level: 2,
      order: 1
    }]
  }, {
    key: 'log',
    title: '日志',
    icon: 'database',
    level: 1,
    order: 8,
    children: [{
      key: 'logAccess',
      title: '访客日志',
      url: '/log/access',
      level: 2,
      order: 1
    }, {
      key: 'logSystem',
      title: '系统日志',
      url: '/log/system',
      level: 2,
      order: 2
    }]
  }];

  constructor() {
    this.initMenus();
  }

  get menus(): MenuItem[] {
    return this.menuData;
  }

  getRootMenu(child: MenuItem): MenuItem {
    const iterator = (menu: MenuItem): MenuItem => {
      if (menu.parent) {
        return iterator(menu.parent);
      }
      return menu;
    };
    return iterator(child);
  }

  private initMenus(): void {
    const iterator = (menus: MenuItem[], parent: MenuItem | null) => {
      menus.forEach((menu) => {
        menu.parent = parent;
        if (menu.children) {
          iterator(menu.children, menu);
        }
      });
    };
    iterator(this.menuData, null);
  }
}
