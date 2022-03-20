import { NgModule } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzI18nModule } from 'ng-zorro-antd/i18n';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzMessageModule } from 'ng-zorro-antd/message';

@NgModule({
  exports: [
    NzI18nModule,
    NzLayoutModule,
    NzMenuModule,
    NzMessageModule,
    NzBreadCrumbModule
  ]
})
export class NgZorroAntdModule {
}
