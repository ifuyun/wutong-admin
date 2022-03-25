import { NgModule } from '@angular/core';
import { CommentFlagPipe } from './comment-flag.pipe';
import { CommentStatusPipe } from './comment-status.pipe';
import { LinkTargetPipe } from './link-target.pipe';
import { LinkVisiblePipe } from './link-visible.pipe';
import { PostStatusPipe } from './post-status.pipe';
import { TaxonomyStatusPipe } from './taxonomy-status.pipe';

@NgModule({
  declarations: [
    PostStatusPipe,
    CommentFlagPipe,
    CommentStatusPipe,
    TaxonomyStatusPipe,
    LinkVisiblePipe,
    LinkTargetPipe
  ],
  imports: [],
  exports: [
    PostStatusPipe,
    CommentFlagPipe,
    CommentStatusPipe,
    TaxonomyStatusPipe,
    LinkVisiblePipe,
    LinkTargetPipe
  ]
})
export class PipesModule {
}
