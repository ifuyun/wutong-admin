import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgZorroAntdModule } from '../../modules/antd/ng-zorro-antd.module';
import { PipesModule } from '../../pipes/pipes.module';
import { CommentListComponent } from './comment-list/comment-list.component';
import { CommentRoutingModule } from './comment-routing.module';

@NgModule({
  declarations: [
    CommentListComponent
  ],
  imports: [
    CommonModule,
    CommentRoutingModule,
    NgZorroAntdModule,
    PipesModule,
    FormsModule
  ]
})
export class CommentModule {
}
