import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ResourceListComponent } from './resource-list/resource-list.component';
import { ResourceRoutingModule } from './resource-routing.module';
import { ResourceUploadComponent } from './resource-upload/resource-upload.component';

@NgModule({
  declarations: [
    ResourceListComponent,
    ResourceUploadComponent
  ],
  imports: [
    CommonModule,
    ResourceRoutingModule
  ]
})
export class ResourceModule {
}
