import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { BaseComponent } from '../../../core/base.component';
import { OptionEntity } from '../../../interfaces/options';
import { OptionsService } from '../../../services/options.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.less']
})
export class PostListComponent extends BaseComponent implements OnInit {
  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: true,
    list: []
  };

  private options: OptionEntity = {};
  private optionsListener!: Subscription;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionsService: OptionsService
  ) {
    super();
  }

  ngOnInit(): void {
    this.optionsListener = this.optionsService.options$.subscribe((options) => {
      this.options = options;
    });
    this.titles = ['文章列表', '文章管理', this.options['site_name']];
    this.updateTitle();
    this.updateBreadcrumb();
  }

  ngOnDestroy() {
    this.optionsListener.unsubscribe();
  }

  protected updateBreadcrumb(): void {
    this.breadcrumbData.list = [{
      label: '文章管理',
      url: 'post',
      tooltip: '文章管理'
    }, {
      label: '文章列表',
      url: '',
      tooltip: '文章列表'
    }];
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }
}
