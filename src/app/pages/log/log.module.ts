import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AccessLogComponent } from './access-log/access-log.component';
import { LogRoutingModule } from './log-routing.module';
import { SystemLogComponent } from './system-log/system-log.component';

@NgModule({
  declarations: [
    SystemLogComponent,
    AccessLogComponent
  ],
  imports: [
    CommonModule,
    LogRoutingModule
  ]
})
export class LogModule {
}
