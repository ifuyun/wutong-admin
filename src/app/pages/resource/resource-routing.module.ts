import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResourceListComponent } from './resource-list/resource-list.component';
import { ResourceUploadComponent } from './resource-upload/resource-upload.component';

const routes: Routes = [
  { path: '', component: ResourceListComponent },
  { path: 'upload', component: ResourceUploadComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourceRoutingModule {
}
