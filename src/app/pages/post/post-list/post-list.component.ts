import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BreadcrumbEntity } from '../../../components/breadcrumb/breadcrumb.interface';
import { BaseComponent } from '../../../core/base.component';
import { OptionEntity } from '../../../interfaces/options';
import { OptionsService } from '../../../services/options.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.less']
})
export class PostListComponent extends BaseComponent implements OnInit {
  showBreadcrumb = true;

  protected titles: string[] = [];
  protected breadcrumbs: BreadcrumbEntity[] = [];

  private options: OptionEntity = {};

  constructor(
    protected title: Title,
    private optionsService: OptionsService
  ) {
    super();
  }

  ngOnInit(): void {
    this.optionsService.options$.subscribe((options) => {
      this.options = options;
    });
    this.titles = ['文章管理', this.options['site_name']];
    this.updateTitle();
  }

  protected updateBreadcrumb(): void {
  }
}
