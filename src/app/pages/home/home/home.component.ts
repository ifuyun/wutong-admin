import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Duration } from 'moment';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { SERVER_START_AT } from '../../../config/constants';
import { BaseComponent } from '../../../core/base.component';
import { CommonService } from '../../../core/common.service';
import { OptionEntity } from '../../../interfaces/option.interface';
import { OptionService } from '../../options/option.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent extends BaseComponent implements OnInit, OnDestroy {
  serverDuration!: Duration;
  statData!: Record<string, number>;

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: false,
    list: []
  };

  private options: OptionEntity = {};
  private optionsListener!: Subscription;
  private statListener!: Subscription;
  private serverTimer!: any;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionService: OptionService,
    private commonService: CommonService,
    private message: NzMessageService
  ) {
    super();
  }


  ngOnInit() {
    this.optionsListener = this.optionService.options$.subscribe((options) => {
      this.options = options;
    });
    this.updatePageInfo();
    this.updateDuration();
    this.statListener = this.commonService.getStatData().subscribe((res) => {
      this.statData = res;
    });
    this.serverTimer = setInterval(() => this.updateDuration(), 60000);
  }

  ngOnDestroy(): void {
    this.optionsListener.unsubscribe();
    this.statListener.unsubscribe();
    clearInterval(this.serverTimer);
  }

  protected updateBreadcrumb(breadcrumbData?: BreadcrumbData): void {
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private updatePageInfo() {
    this.titles = ['仪表盘', this.options['site_name']];
    this.updateTitle();
    this.updateBreadcrumb();
  }

  private updateDuration() {
    this.serverDuration = moment.duration(moment().diff(moment(SERVER_START_AT)));
  }
}
