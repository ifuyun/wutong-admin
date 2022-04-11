import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgZorroAntdModule } from '../../modules/antd/ng-zorro-antd.module';
import { PostModule } from '../posts/post.module';
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
    ResourceRoutingModule,
    PostModule,
    NgZorroAntdModule,
    ReactiveFormsModule
  ]
})
export class ResourceModule {
}
