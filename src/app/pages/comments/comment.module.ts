import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgZorroAntdModule } from '../../modules/antd/ng-zorro-antd.module';
import { PipesModule } from '../../pipes/pipes.module';
import { CommentListComponent } from './comment-list/comment-list.component';
import { CommentRoutingModule } from './comment-routing.module';
import { CommentModalComponent } from './comment-modal/comment-modal.component';

@NgModule({
  declarations: [
    CommentListComponent,
    CommentModalComponent
  ],
  imports: [
    CommonModule,
    CommentRoutingModule,
    NgZorroAntdModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    CommentModalComponent
  ]
})
export class CommentModule {
}
