import { NgModule } from '@angular/core';
import { CommentStatusPipe } from './comment-status.pipe';
import { LinkTargetPipe } from './link-target.pipe';
import { LinkVisiblePipe } from './link-visible.pipe';
import { PostStatusPipe } from './post-status.pipe';
import { TaxonomyStatusPipe } from './taxonomy-status.pipe';

@NgModule({
  declarations: [
    PostStatusPipe,
    CommentStatusPipe,
    TaxonomyStatusPipe,
    LinkVisiblePipe,
    LinkTargetPipe
  ],
  imports: [],
  exports: [
    PostStatusPipe,
    CommentStatusPipe,
    TaxonomyStatusPipe,
    LinkVisiblePipe,
    LinkTargetPipe
  ]
})
export class PipesModule {
}
