import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessLogComponent } from './access-log/access-log.component';
import { SystemLogComponent } from './system-log/system-log.component';

const routes: Routes = [
  { path: 'access', component: AccessLogComponent },
  { path: 'system', component: SystemLogComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogRoutingModule {
}
