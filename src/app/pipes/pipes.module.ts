import { NgModule } from '@angular/core';
import { CommentStatusPipe } from './comment-status.pipe';
import { PostStatusPipe } from './post-status.pipe';
import { TaxonomyStatusPipe } from './taxonomy-status.pipe';

@NgModule({
  declarations: [
    PostStatusPipe,
    CommentStatusPipe,
    TaxonomyStatusPipe
  ],
  imports: [],
  exports: [
    PostStatusPipe,
    CommentStatusPipe,
    TaxonomyStatusPipe
  ]
})
export class PipesModule {
}
