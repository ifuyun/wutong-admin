import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingListComponent } from './setting-list/setting-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: SettingListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule {
}
