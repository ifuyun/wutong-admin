import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AccessLogsComponent } from './access-logs/access-logs.component';
import { LogRoutingModule } from './log-routing.module';
import { SystemLogsComponent } from './system-logs/system-logs.component';

@NgModule({
  declarations: [
    SystemLogsComponent,
    AccessLogsComponent
  ],
  imports: [
    CommonModule,
    LogRoutingModule
  ]
})
export class LogModule {
}
