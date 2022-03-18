import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PostListComponent } from './post-list/post-list.component';
import { PostRoutingModule } from './post-routing.module';

@NgModule({
  declarations: [
    PostListComponent
  ],
  imports: [
    CommonModule,
    PostRoutingModule
  ]
})
export class PostModule {
}
