import { Component } from '@angular/core';
import { PostType } from '../../../config/common.enum';

@Component({
  selector: 'app-article-edit',
  template: `
    <app-post-form [postType]="postType"></app-post-form>
  `
})
export class ArticleEditComponent {
  postType = PostType.POST;
}
