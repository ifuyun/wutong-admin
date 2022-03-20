import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BreadcrumbData, BreadcrumbEntity } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { BaseComponent } from '../../../core/base.component';
import { OptionEntity } from '../../../interfaces/options';
import { OptionsService } from '../../../services/options.service';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.less']
})
export class PostFormComponent extends BaseComponent implements OnInit {
  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: true,
    list: []
  };

  private options: OptionEntity = {};

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionsService: OptionsService
  ) {
    super();
  }

  ngOnInit(): void {
    this.optionsService.options$.subscribe((options) => {
      this.options = options;
    });
    this.titles = ['文章编辑', this.options['site_name']];
    this.updateTitle();
  }

  protected updateBreadcrumb(): void {
  }
}
