import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SettingListComponent } from './setting-list/setting-list.component';
import { SettingRoutingModule } from './setting-routing.module';

@NgModule({
  declarations: [
    SettingListComponent
  ],
  imports: [
    CommonModule,
    SettingRoutingModule
  ]
})
export class SettingModule {
}
