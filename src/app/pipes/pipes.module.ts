import { NgModule } from '@angular/core';
import { CommentFlagPipe } from './comment-flag.pipe';
import { CommentStatusPipe } from './comment-status.pipe';
import { LinkStatusPipe } from './link-status.pipe';
import { LinkTargetPipe } from './link-target.pipe';
import { LinkScopePipe } from './link-scope.pipe';
import { PostStatusPipe } from './post-status.pipe';
import { TaxonomyStatusPipe } from './taxonomy-status.pipe';

@NgModule({
  declarations: [
    PostStatusPipe,
    CommentFlagPipe,
    CommentStatusPipe,
    TaxonomyStatusPipe,
    LinkScopePipe,
    LinkStatusPipe,
    LinkTargetPipe
  ],
  imports: [],
  exports: [
    PostStatusPipe,
    CommentFlagPipe,
    CommentStatusPipe,
    TaxonomyStatusPipe,
    LinkScopePipe,
    LinkStatusPipe,
    LinkTargetPipe
  ]
})
export class PipesModule {
}
