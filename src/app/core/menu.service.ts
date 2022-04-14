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
export class MenuService {
  private menuData: MenuItem[] = [{
    key: 'dashboard',
    title: '仪表盘',
    icon: 'home',
    level: 1,
    order: 1,
    children: [{
      key: 'home',
      title: '首页',
      url: '/home',
      level: 2,
      order: 1
    }]
  }, {
    key: 'posts',
    title: '内容管理',
    icon: 'form',
    level: 1,
    order: 2,
    children: [{
      key: 'postList',
      title: '文章列表',
      url: '/posts',
      level: 2,
      order: 1
    }, {
      key: 'postForm',
      title: '写文章',
      url: '/posts/edit',
      level: 2,
      order: 2
    }, {
      key: 'postStandalone',
      title: '页面列表',
      url: '/posts/standalone',
      level: 2,
      order: 3
    }, {
      key: 'postFormStandalone',
      title: '新建页面',
      url: '/posts/edit-standalone',
      level: 2,
      order: 4
    }]
  }, {
    key: 'comments',
    title: '评论管理',
    icon: 'comment',
    level: 1,
    order: 3,
    children: [{
      key: 'commentList',
      title: '评论列表',
      url: '/comments',
      level: 2,
      order: 1
    }]
  }, {
    key: 'taxonomies',
    title: '类别管理',
    icon: 'tags',
    level: 1,
    order: 4,
    children: [{
      key: 'taxonomyPost',
      title: '文章分类管理',
      url: '/taxonomies/post-categories',
      level: 2,
      order: 1
    }, {
      key: 'taxonomyTag',
      title: '标签管理',
      url: '/taxonomies/tags',
      level: 2,
      order: 2
    }, {
      key: 'taxonomyLink',
      title: '链接分类管理',
      url: '/taxonomies/link-categories',
      level: 2,
      order: 3
    }]
  }, {
    key: 'resources',
    title: '素材管理',
    icon: 'picture',
    level: 1,
    order: 5,
    children: [{
      key: 'resourceList',
      title: '素材列表',
      url: '/resources',
      level: 2,
      order: 1
    }, {
      key: 'resourceUpload',
      title: '文件上传',
      url: '/resources/upload',
      level: 2,
      order: 2
    }]
  }, {
    key: 'links',
    title: '链接管理',
    icon: 'link',
    level: 1,
    order: 6,
    children: [{
      key: 'linkList',
      title: '链接列表',
      url: '/links',
      level: 2,
      order: 1
    }]
  }, {
    key: 'options',
    title: '网站设置',
    icon: 'setting',
    level: 1,
    order: 7,
    children: [{
      key: 'optionsGeneral',
      title: '常规设置',
      url: '/options/general',
      level: 2,
      order: 1
    }, {
      key: 'optionsWriting',
      title: '撰写设置',
      url: '/options/writing',
      level: 2,
      order: 2
    }, {
      key: 'optionsReading',
      title: '阅读设置',
      url: '/options/reading',
      level: 2,
      order: 3
    }, {
      key: 'optionsDiscussion',
      title: '讨论设置',
      url: '/options/discussion',
      level: 2,
      order: 4
    }, {
      key: 'optionsMedia',
      title: '媒体设置',
      url: '/options/media',
      level: 2,
      order: 5
    }]
  }, {
    key: 'logs',
    title: '日志',
    icon: 'database',
    level: 1,
    order: 8,
    children: [{
      key: 'logAccess',
      title: '访客日志',
      url: '/logs/access',
      level: 2,
      order: 1
    }, {
      key: 'logSystem',
      title: '系统日志',
      url: '/logs/system',
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
