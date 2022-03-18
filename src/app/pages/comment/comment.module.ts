import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommentListComponent } from './comment-list/comment-list.component';
import { CommentRoutingModule } from './comment-routing.module';

@NgModule({
  declarations: [
    CommentListComponent
  ],
  imports: [
    CommonModule,
    CommentRoutingModule
  ]
})
export class CommentModule {
}
