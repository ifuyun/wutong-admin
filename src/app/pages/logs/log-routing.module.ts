import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessLogsComponent } from './access-logs/access-logs.component';
import { SystemLogsComponent } from './system-logs/system-logs.component';

const routes: Routes = [
  { path: 'access', component: AccessLogsComponent },
  { path: 'system', component: SystemLogsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogRoutingModule {
}
