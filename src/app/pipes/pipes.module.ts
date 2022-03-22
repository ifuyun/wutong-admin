import { NgModule } from '@angular/core';
import { CommentStatusPipe } from './comment-status.pipe';
import { PostStatusPipe } from './post-status.pipe';

@NgModule({
  declarations: [
    PostStatusPipe,
    CommentStatusPipe
  ],
  imports: [],
  exports: [
    PostStatusPipe,
    CommentStatusPipe
  ]
})
export class PipesModule {
}
